-- =====================================================================
-- ESQUEMA DE BASE DE DATOS: MANO AMIGA (SUPABASE / POSTGRESQL)
-- =====================================================================
-- Plataforma de asistencia y acompañamiento para adultos mayores
-- Basada en membresías mensuales gestionadas por familiares.
-- =====================================================================

-- Extensión para generación de UUIDs (habilitada por defecto en Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. TABLA: usuarios
-- Extiende la tabla auth.users de Supabase
-- ---------------------------------------------------------------------
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    rol TEXT NOT NULL CHECK (rol IN ('senior', 'familiar', 'admin')),
    nombre_completo TEXT NOT NULL,
    telefono TEXT NOT NULL,
    direccion TEXT,
    notas_medicas TEXT, -- Alergias, movilidad reducida, indicaciones de emergencia
    familiar_responsable_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_usuarios_rol ON public.usuarios(rol);
CREATE INDEX idx_usuarios_familiar ON public.usuarios(familiar_responsable_id);

-- ---------------------------------------------------------------------
-- 2. TABLA: planes
-- Catálogo oficial de membresías de Mano Amiga
-- ---------------------------------------------------------------------
CREATE TABLE public.planes (
    id TEXT PRIMARY KEY, -- 'esencial', 'pro', 'premium'
    nombre TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    visitas_mensuales INT NOT NULL CHECK (visitas_mensuales > 0),
    precio_mensual_usd NUMERIC(10, 2) NOT NULL CHECK (precio_mensual_usd >= 0),
    activo BOOLEAN DEFAULT true NOT NULL
);

-- Insertar los planes del modelo de negocio
INSERT INTO public.planes (id, nombre, descripcion, visitas_mensuales, precio_mensual_usd) VALUES
('esencial', 'Plan Esencial', 'Ideal para citas médicas puntuales o chequeos mensuales.', 2, 29.99),
('pro', 'Plan Pro', 'El más popular. Acompañamiento médico, trámites y paseos.', 5, 59.99),
('premium', 'Plan Premium', 'Cuidado y asistencia continua con prioridad garantizada.', 10, 99.99)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- 3. TABLA: suscripciones
-- Gestiona la membresía contratada por el familiar para el adulto mayor
-- ---------------------------------------------------------------------
CREATE TABLE public.suscripciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    familiar_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    senior_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES public.planes(id),
    estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'pausada', 'cancelada', 'vencida')),
    visitas_totales_plan INT NOT NULL,     -- Copia del plan para mantener histórico (ej. 5 para Pro)
    visitas_disponibles INT NOT NULL CHECK (visitas_disponibles >= 0),
    visitas_usadas INT NOT NULL DEFAULT 0 CHECK (visitas_usadas >= 0),
    periodo_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    periodo_fin DATE NOT NULL,
    stripe_subscription_id TEXT,           -- Identificador opcional para pasarela de pagos
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT check_visitas_coherentes CHECK (visitas_disponibles + visitas_usadas = visitas_totales_plan)
);

CREATE INDEX idx_suscripciones_senior ON public.suscripciones(senior_id);
CREATE INDEX idx_suscripciones_familiar ON public.suscripciones(familiar_id);
CREATE INDEX idx_suscripciones_estado ON public.suscripciones(estado);

-- ---------------------------------------------------------------------
-- 4. TABLA: solicitudes_ayuda
-- Cada servicio solicitado por el adulto mayor (descuenta 1 visita)
-- Incluye soporte para el módulo de IA (audio y transcripción)
-- ---------------------------------------------------------------------
CREATE TABLE public.solicitudes_ayuda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    senior_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    suscripcion_id UUID NOT NULL REFERENCES public.suscripciones(id) ON DELETE CASCADE,
    tipo_servicio TEXT NOT NULL CHECK (tipo_servicio IN ('medico', 'casa', 'tramites', 'asistente_voz', 'urgencia')),
    descripcion TEXT NOT NULL,
    
    -- Campos modulares para Integración con Modelo de Lenguaje / Audio IA
    audio_url TEXT,                        -- URL del audio grabado en Supabase Storage
    transcripcion_audio TEXT,              -- Texto extraído por modelo de Speech-to-Text / LLM
    analisis_ia JSONB,                     -- Extracción de entidades (fecha, lugar, urgencia) por el LLM
    
    estado TEXT NOT NULL DEFAULT 'solicitada' CHECK (estado IN ('solicitada', 'asignada', 'en_camino', 'completada', 'cancelada')),
    asistente_asignado_nombre TEXT,
    fecha_solicitud TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    fecha_programada TIMESTAMPTZ,
    notas_finales TEXT
);

CREATE INDEX idx_solicitudes_senior ON public.solicitudes_ayuda(senior_id);
CREATE INDEX idx_solicitudes_estado ON public.solicitudes_ayuda(estado);

-- ---------------------------------------------------------------------
-- 5. FUNCIÓN ATÓMICA DE NEGOCIO: solicitar_ayuda_con_descuento
-- Realiza la validación de saldo y el descuento en una única transacción
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.solicitar_ayuda_con_descuento(
    p_senior_id UUID,
    p_tipo_servicio TEXT,
    p_descripcion TEXT,
    p_audio_url TEXT DEFAULT NULL,
    p_transcripcion_audio TEXT DEFAULT NULL,
    p_analisis_ia JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_suscripcion RECORD;
    v_solicitud_id UUID;
    v_visitas_restantes INT;
BEGIN
    -- 1. Buscar la suscripción activa del adulto mayor con bloqueo de fila (FOR UPDATE)
    -- para prevenir condiciones de carrera (race conditions)
    SELECT * INTO v_suscripcion
    FROM public.suscripciones
    WHERE senior_id = p_senior_id
      AND estado = 'activa'
      AND periodo_fin >= CURRENT_DATE
    ORDER BY created_at DESC
    LIMIT 1
    FOR UPDATE;

    -- Validar si existe suscripción activa
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró una suscripción activa para este usuario o el periodo ha expirado.';
    END IF;

    -- Validar si le quedan visitas disponibles
    IF v_suscripcion.visitas_disponibles <= 0 THEN
        RAISE EXCEPTION 'Saldo insuficiente: Has utilizado todas las visitas disponibles de tu membresía este mes (% de %). Contacta a tu familiar para renovar.', 
            v_suscripcion.visitas_usadas, v_suscripcion.visitas_totales_plan;
    END IF;

    -- 2. Descontar 1 visita y sumar 1 a visitas_usadas
    UPDATE public.suscripciones
    SET visitas_disponibles = visitas_disponibles - 1,
        visitas_usadas = visitas_usadas + 1,
        updated_at = NOW()
    WHERE id = v_suscripcion.id
    RETURNING visitas_disponibles INTO v_visitas_restantes;

    -- 3. Crear el registro en solicitudes_ayuda
    INSERT INTO public.solicitudes_ayuda (
        senior_id,
        suscripcion_id,
        tipo_servicio,
        descripcion,
        audio_url,
        transcripcion_audio,
        analisis_ia,
        estado
    ) VALUES (
        p_senior_id,
        v_suscripcion.id,
        p_tipo_servicio,
        p_descripcion,
        p_audio_url,
        p_transcripcion_audio,
        p_analisis_ia,
        'solicitada'
    )
    RETURNING id INTO v_solicitud_id;

    -- 4. Devolver resultado exitoso estructurado
    RETURN jsonb_build_object(
        'success', true,
        'mensaje', 'Solicitud creada con éxito y visita descontada.',
        'solicitud_id', v_solicitud_id,
        'visitas_restantes', v_visitas_restantes,
        'visitas_totales', v_suscripcion.visitas_totales_plan
    );
END;
$$;

-- ---------------------------------------------------------------------
-- 6. POLÍTICAS DE SEGURIDAD (Row Level Security - RLS)
-- ---------------------------------------------------------------------
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitudes_ayuda ENABLE ROW LEVEL SECURITY;

-- Planes: Lectura pública para cualquier usuario autenticado o anónimo (Pricing)
CREATE POLICY "Planes visibles para todos"
ON public.planes FOR SELECT
TO authenticated, anon
USING (activo = true);

-- Usuarios: Cada usuario puede ver su perfil, y un familiar puede ver a sus seniors asociados
CREATE POLICY "Usuarios ven su propio perfil"
ON public.usuarios FOR SELECT
TO authenticated
USING (
    auth.uid() = id OR 
    familiar_responsable_id = auth.uid() OR
    id = (SELECT familiar_responsable_id FROM public.usuarios WHERE id = auth.uid())
);

-- Suscripciones: El familiar y el senior pueden ver su propia suscripción
CREATE POLICY "Ver suscripciones propias"
ON public.suscripciones FOR SELECT
TO authenticated
USING (
    familiar_id = auth.uid() OR senior_id = auth.uid()
);

-- Solicitudes de Ayuda: El senior y el familiar pueden ver el historial de solicitudes
CREATE POLICY "Ver solicitudes propias"
ON public.solicitudes_ayuda FOR SELECT
TO authenticated
USING (
    senior_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.suscripciones s 
        WHERE s.id = solicitudes_ayuda.suscripcion_id AND s.familiar_id = auth.uid()
    )
);

-- Permiso de inserción de solicitudes a través de la función segura
GRANT EXECUTE ON FUNCTION public.solicitar_ayuda_con_descuento TO authenticated;
