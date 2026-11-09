# 🤝 Mano Amiga - Plataforma Accesible para Adultos Mayores

Plataforma de asistencia y acompañamiento basada en suscripciones mensuales. Los familiares contratan y gestionan el plan, mientras que el adulto mayor dispone de una interfaz web ultra accesible, con botones gigantes, alto contraste y control de voz.

---

## 🌟 Características de Accesibilidad (WCAG 2.1/2.2 AAA)
1. **Tipografía Extra Grande y Escalable**: Tamaño base mínimo de 24px (`text-2xl`), con selector en vivo en pantalla (`A Normal`, `A+ Grande`, `A++ Gigante`).
2. **Navegación Táctil Forgiving**: Botones con áreas táctiles gigantes (> 80px de altura) y bordes de 8px para una diferenciación visual clara.
3. **Cero menús complejos**: Toda la funcionalidad principal se encuentra a la vista en un solo toque, sin menús desplegables (dropdowns) ni hamburguesas ocultas.
4. **Retroalimentación por Voz (Text-to-Speech)**: Integración con la Web Speech API para lectura auditiva de cada acción seleccionada.
5. **Módulo de Asistente de Voz / IA**: Graba audio directamente desde el navegador para que el usuario pueda pedir ayuda hablando.

---

## 📁 Estructura del Proyecto

```text
mano-amiga/
├── supabase/
│   └── schema.sql              # Esquema SQL completo con RLS y función atómica de descuento
├── src/
│   ├── components/
│   │   ├── SeniorDashboard.jsx # Dashboard accesible para el adulto mayor
│   │   └── PricingCards.jsx    # Tarjeta de membresías y precios para el familiar
│   ├── hooks/
│   │   └── useVoiceAssistant.js# Hook modular de captura y procesamiento de audio con IA
│   ├── lib/
│   │   └── supabaseClient.js   # Conexión al SDK de Supabase
│   ├── App.jsx                 # Switcher de demostración interactiva
│   ├── main.jsx
│   └── index.css               # Estilos globales y foco WCAG
├── netlify.toml                # Configuración lista para despliegue en Netlify
├── tailwind.config.js
└── package.json
```

---

## 🚀 Despliegue en Netlify

1. Sube este repositorio a GitHub.
2. Inicia sesión en [Netlify](https://www.netlify.com/) y haz clic en **"Add new site" > "Import an existing project"**.
3. Configuración de Build:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Variables de entorno (Environment Variables):
   - `VITE_SUPABASE_URL`: Tu URL del proyecto Supabase.
   - `VITE_SUPABASE_ANON_KEY`: Tu clave pública anónima de Supabase.

---

## 🧠 Integración Futura con Modelos de Lenguaje / Audio IA

El hook `useVoiceAssistant.js` y el campo `solicitudes_ayuda.analisis_ia` están preparados para conectarse a un modelo multimodal (como **Gemini 2.5 Flash**):

```javascript
// Ejemplo de prompt del sistema para el LLM procesador de audio:
`Eres el asistente inteligente de Mano Amiga. Analiza el audio del adulto mayor y extrae un JSON estructurado con:
{
  "intencion": "medico" | "casa" | "tramites" | "urgencia",
  "descripcion": "resumen claro de lo que necesita",
  "urgencia": "alta" | "media" | "baja"
}`
```
