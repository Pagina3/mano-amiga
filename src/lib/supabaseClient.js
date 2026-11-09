import { createClient } from '@supabase/supabase-js';

// Variables de entorno para Netlify / Vite
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'tu-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Función auxiliar para invocar el RPC seguro de solicitud con descuento de visita
 */
export async function solicitarAyudaBackend({
  seniorId,
  tipoServicio,
  descripcion,
  audioUrl = null,
  transcripcionAudio = null,
  analisisIa = null
}) {
  const { data, error } = await supabase.rpc('solicitar_ayuda_con_descuento', {
    p_senior_id: seniorId,
    p_tipo_servicio: tipoServicio,
    p_descripcion: descripcion,
    p_audio_url: audioUrl,
    p_transcripcion_audio: transcripcionAudio,
    p_analisis_ia: analisisIa
  });

  if (error) {
    console.error('Error al solicitar ayuda:', error);
    throw error;
  }

  return data;
}
