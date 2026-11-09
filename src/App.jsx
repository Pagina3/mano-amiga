import React, { useState } from 'react';
import SeniorDashboard from './components/SeniorDashboard';
import PricingCards from './components/PricingCards';

export default function App() {
  // 'senior' o 'familiar' para alternar la vista en modo demostración
  const [currentView, setCurrentView] = useState('senior');

  // Estado del saldo mensual del usuario (Ej. Plan Pro con 5 visitas)
  const [subscriptionState, setSubscriptionState] = useState({
    planName: 'Plan Pro',
    visitsTotal: 5,
    visitsRemaining: 4,
    visitsUsed: 1,
    seniorName: 'Don Manuel',
    familiarName: 'Carlos (Hijo)'
  });

  // Manejo del descuento de visita cuando el adulto mayor solicita ayuda
  const handleRequestHelp = (service) => {
    if (subscriptionState.visitsRemaining > 0) {
      setSubscriptionState(prev => ({
        ...prev,
        visitsRemaining: prev.visitsRemaining - 1,
        visitsUsed: prev.visitsUsed + 1
      }));
      console.log(`[MANO AMIGA] Solicitud registrada: ${service.title}. Visita descontada.`);
    }
  };

  // Manejo de cambio o compra de plan por el familiar
  const handleSelectPlan = (plan) => {
    setSubscriptionState(prev => ({
      ...prev,
      planName: plan.name,
      visitsTotal: plan.visits,
      visitsRemaining: plan.visits,
      visitsUsed: 0
    }));
    alert(`¡Plan ${plan.name} activado con éxito! Se cargaron ${plan.visits} visitas para ${subscriptionState.seniorName}.`);
  };

  return (
    <div>
      {/* Switch superior para alternar rol / vista de la plataforma */}
      <nav className="bg-slate-900 text-white p-3 border-b-4 border-yellow-400 flex flex-wrap items-center justify-between gap-3 px-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-hidden="true">🤝</span>
          <span className="font-black text-xl tracking-tight text-yellow-300">
            Mano Amiga
          </span>
          <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded ml-2">
            Demo Interactiva
          </span>
        </div>

        {/* Selector de Rol */}
        <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setCurrentView('senior')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              currentView === 'senior'
                ? 'bg-yellow-400 text-slate-950 shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Vista: Adulto Mayor (Dashboard)
          </button>
          <button
            onClick={() => setCurrentView('familiar')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              currentView === 'familiar'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Vista: Familiar (Membresías)
          </button>
        </div>
      </nav>

      {/* Renderizado condicional según la vista */}
      {currentView === 'senior' ? (
        <SeniorDashboard
          userName={subscriptionState.seniorName}
          visitsRemaining={subscriptionState.visitsRemaining}
          visitsTotal={subscriptionState.visitsTotal}
          familyContactName={subscriptionState.familiarName}
          familyContactPhone="tel:+123456789"
          onRequestHelp={handleRequestHelp}
        />
      ) : (
        <PricingCards onSelectPlan={handleSelectPlan} />
      )}
    </div>
  );
}
