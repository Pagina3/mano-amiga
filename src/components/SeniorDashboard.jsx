import React, { useState, useEffect } from 'react';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';

/**
 * SeniorDashboard Component - Mano Amiga
 * Diseñado bajo estándares WCAG 2.1/2.2 AAA para personas mayores.
 * - Tipografía mínima de 24px con selector de tamaño en pantalla.
 * - Botones gigantes (área táctil > 80px de altura) con bordes gruesos y alto contraste.
 * - Soporte de síntesis de voz (Text-to-Speech) para lectura en voz alta.
 * - Módulo de audio con IA integrado para solicitudes habladas.
 */
export default function SeniorDashboard({
  userName = "Don Manuel",
  visitsRemaining = 4,
  visitsTotal = 5,
  familyContactName = "Carlos (Hijo)",
  familyContactPhone = "tel:+5491100000000",
  onRequestHelp = () => {}
}) {
  // Estado para el tamaño de letra: 'normal' (24px base), 'large' (28px base), 'xlarge' (34px base)
  const [fontSizeLevel, setFontSizeLevel] = useState('normal');
  
  // Estado para modal de confirmación simplificado
  const [selectedService, setSelectedService] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null); // 'success' | null
  const [ttsEnabled, setTtsEnabled] = useState(true);

  // Hook de asistente de voz para solicitudes con Inteligencia Artificial
  const {
    isRecording,
    isProcessing,
    transcription,
    error: voiceError,
    startRecording,
    stopRecording
  } = useVoiceAssistant({
    onProcessed: (result) => {
      setSelectedService({
        id: result.intencion,
        title: "Solicitud por Voz",
        icon: "🎙️",
        description: result.transcripcion,
        isVoice: true
      });
      setIsConfirming(true);
      speak(`Has dicho: ${result.transcripcion}. ¿Deseas confirmar la solicitud?`);
    }
  });

  // Función de accesibilidad para síntesis de voz (Text-to-Speech)
  const speak = (text) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9; // Hablar un poco más pausado para mayor claridad
    window.speechSynthesis.speak(utterance);
  };

  // Clases dinámicas según el selector de fuente accesible
  const fontSizes = {
    normal: {
      base: 'text-2xl',       // 24px
      heading: 'text-4xl',    // 36px
      buttonTitle: 'text-3xl',// 30px
      desc: 'text-xl',        // 20px
      banner: 'text-2xl'
    },
    large: {
      base: 'text-3xl',       // 30px
      heading: 'text-5xl',    // 48px
      buttonTitle: 'text-4xl',// 36px
      desc: 'text-2xl',       // 24px
      banner: 'text-3xl'
    },
    xlarge: {
      base: 'text-4xl',       // 36px
      heading: 'text-6xl',    // 60px
      buttonTitle: 'text-5xl',// 48px
      desc: 'text-3xl',       // 30px
      banner: 'text-4xl'
    }
  }[fontSizeLevel];

  // Servicios principales disponibles (3 a 4 opciones claras)
  const services = [
    {
      id: 'medico',
      title: 'Ir al Médico',
      subtitle: 'Citas médicas, doctores o farmacia',
      icon: '🩺',
      badgeColor: 'bg-blue-100 text-blue-900',
      borderColor: 'border-blue-700 hover:bg-blue-50 active:bg-blue-100',
      voiceText: 'Opción 1: Ir al Médico. Te acompañamos a tu consulta o a buscar medicamentos.'
    },
    {
      id: 'casa',
      title: 'Ayuda en Casa',
      subtitle: 'Compañía, lectura o apoyo en el hogar',
      icon: '🏠',
      badgeColor: 'bg-emerald-100 text-emerald-900',
      borderColor: 'border-emerald-700 hover:bg-emerald-50 active:bg-emerald-100',
      voiceText: 'Opción 2: Ayuda en Casa. Para acompañarte, conversar o ayudarte en tus tareas diarias.'
    },
    {
      id: 'tramites',
      title: 'Trámites y Compras',
      subtitle: 'Ir al banco, compras o pagos',
      icon: '📋',
      badgeColor: 'bg-purple-100 text-purple-900',
      borderColor: 'border-purple-700 hover:bg-purple-50 active:bg-purple-100',
      voiceText: 'Opción 3: Trámites y Compras. Te ayudamos a pagar cuentas, hacer compras o ir al banco.'
    }
  ];

  const handleSelectService = (service) => {
    setSelectedService(service);
    setIsConfirming(true);
    speak(`Has seleccionado: ${service.title}. Toca el botón verde grande para confirmar.`);
  };

  const handleConfirmRequest = () => {
    if (visitsRemaining <= 0) {
      speak('No te quedan visitas este mes. Por favor llama a tu familiar para recargar.');
      alert('Has agotado las visitas de este mes. Tu familiar puede renovar el plan.');
      return;
    }

    // Invocar el callback de la lógica de negocio
    onRequestHelp(selectedService);
    setRequestStatus('success');
    speak(`¡Excelente! Tu solicitud para ${selectedService.title} fue enviada. Tu familiar ya fue notificado.`);
  };

  const handleCloseModal = () => {
    setIsConfirming(false);
    setSelectedService(null);
    setRequestStatus(null);
  };

  return (
    <div className="min-h-screen bg-amber-50/40 text-slate-900 p-4 sm:p-6 md:p-8 font-sans selection:bg-yellow-300">
      
      {/* ========================================================= */}
      {/* BARRA SUPERIOR DE ACCESIBILIDAD Y CONTROL DE TAMAÑO        */}
      {/* ========================================================= */}
      <header className="max-w-4xl mx-auto mb-6 bg-white border-4 border-slate-900 rounded-3xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Saludo Principal */}
          <div>
            <h1 className={`${fontSizes.heading} font-black text-slate-950 tracking-tight`}>
              Hola, <span className="underline decoration-yellow-400 decoration-8">{userName}</span>
            </h1>
            <p className={`${fontSizes.desc} font-bold text-slate-700 mt-1`}>
              ¿Qué necesitas hacer hoy?
            </p>
          </div>

          {/* Controles de Accesibilidad (Tamaño de Letra & Sonido) */}
          <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border-2 border-slate-800">
            <span className="text-lg font-black mr-1 text-slate-800 hidden sm:inline" aria-hidden="true">
              Letra:
            </span>
            <button
              onClick={() => { setFontSizeLevel('normal'); speak('Tamaño de letra normal seleccionado'); }}
              className={`px-4 py-2 rounded-xl font-black text-xl border-2 transition-transform active:scale-95 ${
                fontSizeLevel === 'normal' 
                  ? 'bg-yellow-400 border-slate-950 text-slate-950 shadow-md ring-2 ring-slate-900' 
                  : 'bg-white border-slate-400 text-slate-700'
              }`}
              aria-label="Tamaño de letra normal (24 pixeles)"
            >
              A
            </button>
            <button
              onClick={() => { setFontSizeLevel('large'); speak('Tamaño de letra grande seleccionado'); }}
              className={`px-4 py-2 rounded-xl font-black text-2xl border-2 transition-transform active:scale-95 ${
                fontSizeLevel === 'large' 
                  ? 'bg-yellow-400 border-slate-950 text-slate-950 shadow-md ring-2 ring-slate-900' 
                  : 'bg-white border-slate-400 text-slate-700'
              }`}
              aria-label="Tamaño de letra grande (30 pixeles)"
            >
              A+
            </button>
            <button
              onClick={() => { setFontSizeLevel('xlarge'); speak('Tamaño de letra gigante seleccionado'); }}
              className={`px-4 py-2 rounded-xl font-black text-3xl border-2 transition-transform active:scale-95 ${
                fontSizeLevel === 'xlarge' 
                  ? 'bg-yellow-400 border-slate-950 text-slate-950 shadow-md ring-2 ring-slate-900' 
                  : 'bg-white border-slate-400 text-slate-700'
              }`}
              aria-label="Tamaño de letra gigante (36 pixeles)"
            >
              A++
            </button>

            {/* Alternar lectura por voz */}
            <button
              onClick={() => {
                const nextState = !ttsEnabled;
                setTtsEnabled(nextState);
                if (nextState) speak('Voz activada. Leeremos las opciones en voz alta.');
              }}
              className={`p-2 rounded-xl border-2 ml-2 transition-transform active:scale-95 ${
                ttsEnabled ? 'bg-emerald-400 border-slate-950 text-slate-950' : 'bg-gray-200 border-slate-400 text-slate-500'
              }`}
              title={ttsEnabled ? 'Desactivar voz' : 'Activar voz'}
              aria-label={ttsEnabled ? 'Voz activada' : 'Voz desactivada'}
            >
              <span className="text-2xl" role="img" aria-hidden="true">
                {ttsEnabled ? '🔊' : '🔇'}
              </span>
            </button>
          </div>
        </div>

        {/* Tarjeta de Saldo de Visitas Mensuales */}
        <div className="mt-4 p-4 rounded-2xl bg-amber-100 border-4 border-amber-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-4xl" role="img" aria-hidden="true">🎫</span>
            <span className={`${fontSizes.banner} font-black text-amber-950`}>
              Te quedan <strong className="underline text-black">{visitsRemaining} de {visitsTotal}</strong> visitas este mes
            </span>
          </div>
          <span className="text-lg font-bold text-amber-900 bg-amber-200/80 px-3 py-1 rounded-full border border-amber-600">
            Plan Pro Activo
          </span>
        </div>
      </header>

      {/* ========================================================= */}
      {/* BOTONES GIGANTES DE NAVEGACIÓN Y SOLICITUD (GRID WCAG)     */}
      {/* ========================================================= */}
      <main className="max-w-4xl mx-auto space-y-6" role="main">

        {/* Botones de Servicios Principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => handleSelectService(service)}
              onFocus={() => speak(service.voiceText)}
              className={`w-full bg-white border-8 ${service.borderColor} rounded-3xl p-6 md:p-8 
                         text-left shadow-2xl flex flex-col items-center justify-between text-center
                         transition-all duration-150 transform hover:-translate-y-1 active:translate-y-1 
                         focus:outline-none focus:ring-8 focus:ring-yellow-400 min-h-[220px]`}
              aria-label={`${service.title}. ${service.subtitle}`}
            >
              <span className="text-6xl sm:text-7xl mb-3 block transform group-hover:scale-110" role="img" aria-hidden="true">
                {service.icon}
              </span>
              <div>
                <span className={`${fontSizes.buttonTitle} font-black text-slate-950 block leading-tight`}>
                  {service.title}
                </span>
                <span className={`${fontSizes.desc} font-bold text-slate-600 block mt-2 leading-snug`}>
                  {service.subtitle}
                </span>
              </div>
              <span className="mt-4 inline-block bg-slate-900 text-yellow-300 font-black px-4 py-2 rounded-2xl text-xl w-full">
                Tocar para pedir
              </span>
            </button>
          ))}
        </div>

        {/* ========================================================= */}
        {/* BOTÓN DE ASISTENTE DE VOZ / INTELIGENCIA ARTIFICIAL        */}
        {/* ========================================================= */}
        <section 
          className="bg-indigo-900 text-white rounded-3xl border-8 border-indigo-950 p-6 sm:p-8 shadow-2xl text-center"
          aria-labelledby="ia-assistant-title"
        >
          <div className="flex flex-col items-center max-w-2xl mx-auto">
            <span className="text-6xl mb-2" role="img" aria-hidden="true">
              {isRecording ? '🔴' : isProcessing ? '⏳' : '🎙️'}
            </span>
            <h2 id="ia-assistant-title" className={`${fontSizes.buttonTitle} font-black text-yellow-300 mb-2`}>
              {isRecording 
                ? "Te estoy escuchando... Habla ahora" 
                : isProcessing 
                ? "Entendiendo tu voz..." 
                : "¿Prefieres pedir ayuda con tu voz?"}
            </h2>
            <p className={`${fontSizes.desc} text-indigo-100 font-semibold mb-6`}>
              Mantén presionado el botón gigante de abajo y dinos qué necesitas.
            </p>

            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`w-full max-w-lg py-6 px-8 rounded-3xl font-black ${fontSizes.buttonTitle}
                         border-8 border-white shadow-2xl transition-all duration-150 transform
                         active:scale-95 focus:outline-none focus:ring-8 focus:ring-yellow-400
                         ${isRecording 
                           ? 'bg-red-600 text-white animate-pulse border-red-300' 
                           : 'bg-yellow-400 text-slate-950 hover:bg-yellow-300'}`}
              aria-label="Botón para hablar. Mantén presionado para grabar tu mensaje de voz."
            >
              {isRecording ? "¡Suelta para Enviar!" : "MANTÉN AQUÍ PARA HABLAR"}
            </button>

            {voiceError && (
              <p className="mt-4 bg-red-100 text-red-900 font-bold p-3 rounded-xl text-xl">
                {voiceError}
              </p>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* BOTÓN DE CONTACTO RÁPIDO / FAMILIAR DE EMERGENCIA         */}
        {/* ========================================================= */}
        <section className="bg-rose-100 border-8 border-rose-600 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <span className="text-5xl" role="img" aria-hidden="true">📞</span>
            <div>
              <h3 className={`${fontSizes.base} font-black text-rose-950`}>
                ¿Necesitas hablar con tu familia?
              </h3>
              <p className={`${fontSizes.desc} font-bold text-rose-800`}>
                Llamar directo a: {familyContactName}
              </p>
            </div>
          </div>
          <a
            href={familyContactPhone}
            onClick={() => speak(`Llamando a ${familyContactName}`)}
            className="w-full sm:w-auto text-center bg-rose-600 hover:bg-rose-700 active:bg-rose-800 
                       text-white font-black text-2xl py-4 px-8 rounded-2xl border-4 border-rose-950
                       shadow-lg focus:outline-none focus:ring-8 focus:ring-yellow-400"
            aria-label={`Llamar por teléfono a ${familyContactName}`}
          >
            Llamar Ahora
          </a>
        </section>
      </main>

      {/* ========================================================= */}
      {/* MODAL DE CONFIRMACIÓN ULTRA ACCESIBLE                     */}
      {/* ========================================================= */}
      {isConfirming && selectedService && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <div className="bg-white border-8 border-slate-950 rounded-3xl max-w-xl w-full p-6 sm:p-8 text-center shadow-2xl animate-fade-in">
            
            {requestStatus === 'success' ? (
              // Vista de Éxito
              <div>
                <span className="text-8xl mb-4 block animate-bounce" role="img" aria-hidden="true">✅</span>
                <h3 id="confirm-dialog-title" className={`${fontSizes.heading} font-black text-emerald-800 mb-4`}>
                  ¡Solicitud Enviada!
                </h3>
                <p className={`${fontSizes.base} font-bold text-slate-800 mb-4 leading-relaxed`}>
                  Hemos descontado 1 visita de tu saldo mensual.
                </p>
                <div className="bg-emerald-100 border-4 border-emerald-500 rounded-2xl p-4 mb-6">
                  <p className={`${fontSizes.base} font-black text-emerald-950`}>
                    Visitas restantes: {visitsRemaining - 1} de {visitsTotal}
                  </p>
                  <p className="text-xl font-bold text-emerald-900 mt-1">
                    Tu familiar ({familyContactName}) recibió una notificación inmediata.
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-full py-6 rounded-2xl font-black text-3xl bg-slate-950 text-white hover:bg-slate-800 border-4 border-black"
                >
                  Entendido, volver
                </button>
              </div>
            ) : (
              // Vista de Confirmación
              <div>
                <span className="text-8xl mb-4 block" role="img" aria-hidden="true">
                  {selectedService.icon}
                </span>
                
                <h3 id="confirm-dialog-title" className={`${fontSizes.heading} font-black text-slate-950 mb-2`}>
                  ¿Pedir ayuda para {selectedService.title}?
                </h3>

                {selectedService.isVoice ? (
                  <div className="bg-indigo-50 border-4 border-indigo-400 p-4 rounded-2xl mb-6">
                    <p className="text-xl font-bold text-indigo-950">Tu mensaje grabado:</p>
                    <p className={`${fontSizes.desc} font-black text-indigo-900 mt-1 italic`}>
                      "{selectedService.description}"
                    </p>
                  </div>
                ) : (
                  <p className={`${fontSizes.base} font-bold text-slate-700 mb-6`}>
                    Se descontará 1 visita de tu plan mensual (te quedarán {visitsRemaining - 1} visitas).
                  </p>
                )}

                {/* Botones Gigantes de Acción */}
                <div className="space-y-4">
                  <button
                    onClick={handleConfirmRequest}
                    className="w-full min-h-[85px] py-6 px-8 rounded-3xl font-black text-3xl sm:text-4xl
                               bg-emerald-600 hover:bg-emerald-700 text-white border-8 border-emerald-900
                               shadow-xl transform active:scale-95 focus:outline-none focus:ring-8 focus:ring-yellow-400"
                    aria-label="Confirmar la solicitud y descontar una visita"
                  >
                    SÍ, PEDIR AHORA
                  </button>

                  <button
                    onClick={handleCloseModal}
                    className="w-full min-h-[75px] py-4 px-8 rounded-3xl font-black text-2xl sm:text-3xl
                               bg-rose-100 hover:bg-rose-200 text-rose-950 border-4 border-rose-800
                               focus:outline-none focus:ring-8 focus:ring-yellow-400"
                    aria-label="Cancelar y regresar a la pantalla anterior"
                  >
                    NO, VOLVER ATRÁS
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
