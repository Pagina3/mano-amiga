import React, { useState } from 'react';

/**
 * PricingCards Component - Mano Amiga
 * Diseñado para que los familiares contraten la membresía mensual de acompañamiento
 * para sus adultos mayores, con transparencia total y alta accesibilidad.
 */
export default function PricingCards({ onSelectPlan = () => {} }) {
  const [selectedPlanId, setSelectedPlanId] = useState('pro');

  const plans = [
    {
      id: 'esencial',
      name: 'Plan Esencial',
      visits: 2,
      price: 29.99,
      badge: 'Básico',
      isPopular: false,
      tagline: 'Ideal para acompañamientos puntuales y chequeos mensuales.',
      features: [
        '2 visitas de acompañamiento al mes (hasta 3h c/u)',
        'Acompañamiento a citas médicas o farmacia',
        'Notificación por WhatsApp al familiar al inicio y fin',
        'Asistente capacitado y verificado con antecedentes',
        'Interfaz accesible para el adulto mayor'
      ],
      ctaText: 'Elegir Plan Esencial',
      cardBorder: 'border-slate-300 hover:border-slate-500'
    },
    {
      id: 'pro',
      name: 'Plan Pro',
      visits: 5,
      price: 59.99,
      badge: 'Más Popular',
      isPopular: true,
      tagline: 'La tranquilidad completa para el cuidado y acompañamiento habitual.',
      features: [
        '5 visitas de acompañamiento al mes (hasta 3h c/u)',
        'Acompañamiento médico, trámites bancarios y hogar',
        'Reporte de audio y resumen de visita enviado por IA',
        'Seguimiento en tiempo real vía GPS durante traslados',
        'Línea de soporte telefónico prioritaria para el familiar',
        'Acompañante preferencial asignado'
      ],
      ctaText: 'Contratar Plan Pro',
      cardBorder: 'border-blue-600 ring-4 ring-blue-500/20 shadow-2xl'
    },
    {
      id: 'premium',
      name: 'Plan Premium',
      visits: 10,
      price: 99.99,
      badge: 'Cuidado Total',
      isPopular: false,
      tagline: 'Asistencia frecuente y respaldo integral para la máxima serenidad.',
      features: [
        '10 visitas de acompañamiento al mes (hasta 3h c/u)',
        'Todas las ventajas del Plan Pro',
        'Visitas de fin de semana incluidas sin recargo',
        'Reportes médicos detallados en PDF para la familia',
        'Coordinador de caso y gerontólogo de cabecera',
        'Asistente de reemplazo garantizado en menos de 2 horas'
      ],
      ctaText: 'Elegir Plan Premium',
      cardBorder: 'border-purple-300 hover:border-purple-600'
    }
  ];

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-50 min-h-screen">
      {/* Encabezado informativo para el familiar */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-blue-700 font-extrabold text-lg sm:text-xl tracking-wider uppercase bg-blue-100 px-4 py-1.5 rounded-full">
          Membresías Familiares Mano Amiga
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mt-4 tracking-tight">
          Cuidado, cariño y acompañamiento para quienes más quieres
        </h2>
        <p className="text-lg sm:text-xl font-medium text-slate-600 mt-4 leading-relaxed">
          Tú gestionas la suscripción mensual y tu ser querido disfruta de una interfaz 
          ultra sencilla en su teléfono para pedir ayuda con 1 solo toque.
        </p>
      </div>

      {/* Grid de Tarjetas de Precios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl border-4 p-8 flex flex-col justify-between transition-all duration-200 relative ${
                plan.isPopular ? 'scale-105 z-10' : 'hover:-translate-y-1'
              } ${plan.cardBorder}`}
            >
              {/* Badge destacado */}
              {plan.isPopular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-700 text-white font-black text-sm uppercase px-6 py-1.5 rounded-full shadow-lg tracking-wider">
                  ⭐ Recomendado para Familias
                </div>
              )}

              <div>
                {/* Título y Badge */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-black text-slate-950">
                    {plan.name}
                  </h3>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    plan.isPopular ? 'bg-blue-100 text-blue-900' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {plan.badge}
                  </span>
                </div>

                {/* Resumen de visitas (Requerimiento clave del negocio) */}
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl" role="img" aria-hidden="true">🎫</span>
                    <span className="text-xl font-black text-amber-950">
                      {plan.visits} visitas incluidas / mes
                    </span>
                  </div>
                  <p className="text-xs font-bold text-amber-800 mt-1">
                    Cada solicitud descuenta 1 visita automáticamente de su saldo.
                  </p>
                </div>

                {/* Precio mensual */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-black text-slate-950">${plan.price}</span>
                    <span className="text-slate-500 font-bold ml-2 text-lg">/mes USD</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-500 mt-2">
                    {plan.tagline}
                  </p>
                </div>

                <hr className="border-slate-200 mb-6" />

                {/* Lista de características */}
                <ul className="space-y-3.5 mb-8" aria-label={`Características del ${plan.name}`}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-slate-700 font-medium text-base">
                      <svg
                        className="w-5 h-5 text-emerald-600 mr-2.5 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botón de Contratación */}
              <button
                onClick={() => {
                  setSelectedPlanId(plan.id);
                  onSelectPlan(plan);
                }}
                className={`w-full py-4 px-6 rounded-2xl font-black text-xl transition-all duration-150 shadow-md ${
                  plan.isPopular
                    ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-500/30'
                    : 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white'
                } focus:outline-none focus:ring-4 focus:ring-blue-400`}
                aria-label={`Contratar ${plan.name} por ${plan.price} dólares mensuales`}
              >
                {plan.ctaText}
              </button>
            </div>
          );
        })}
      </div>

      {/* Garantía y Confianza */}
      <div className="mt-16 bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-4xl sm:text-5xl" role="img" aria-hidden="true">🛡️</span>
          <div>
            <h4 className="text-xl font-bold text-slate-900">
              Tranquilidad garantizada para toda la familia
            </h4>
            <p className="text-slate-600 font-medium text-sm sm:text-base mt-0.5">
              Sin contratos de permanencia. Puedes pausar o cancelar la membresía cuando desees con un clic.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-emerald-700 font-extrabold text-base bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl">
            Acompañantes 100% verificados
          </span>
        </div>
      </div>
    </section>
  );
}
