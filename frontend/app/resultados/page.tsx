// Page: Results (app/resultados/page.tsx)
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RiskMeter from '@/components/RiskMeter';
import ShapChart from '@/components/ShapChart';

export default function ResultadosPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [answersCount, setAnswersCount] = useState(0);
  const [citasNotes, setCitasNotes] = useState('');
  const [citaSuccess, setCitaSuccess] = useState(false);
  const [submittingCita, setSubmittingCita] = useState(false);

  // High-Fidelity Mock Prediction if visited directly or unseeded
  const DEFAULT_PREDICTION = {
    prob_ansiedad: 0.84,
    prob_depresion: 0.38,
    tac_score: 100.0,
    shap_values: [
      { feature_name: "Preocupación incontrolable (P2)", attribution: 0.28 },
      { feature_name: "Nerviosismo / Ansiedad (P1)", attribution: 0.24 },
      { feature_name: "Insomnio por ansiedad (P10)", attribution: 0.18 },
      { feature_name: "Dificultad para relajarse (P4)", attribution: 0.12 },
      { feature_name: "Poco interés / Anhedonia (P11)", attribution: -0.04 }
    ],
    early_stop: false
  };

  useEffect(() => {
    setMounted(true);
    const storedPred = localStorage.getItem('last_prediction');
    const storedCount = localStorage.getItem('last_answers_count');
    
    if (storedPred) {
      setPrediction(JSON.parse(storedPred));
    } else {
      setPrediction(DEFAULT_PREDICTION);
    }
    
    if (storedCount) {
      setAnswersCount(parseInt(storedCount));
    } else {
      setAnswersCount(8);
    }
  }, []);

  const handleBookCita = async () => {
    setSubmittingCita(true);
    try {
      const studentId = localStorage.getItem('demo_user_id') || 'demo-student-id';
      
      const res = await fetch('/api/psicologo/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: studentId,
          fecha: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Schedule in 2 days
          notas: citasNotes || 'Cita de derivación solicitada tras reporte de cribado con riesgo elevado.'
        })
      });

      if (res.ok) {
        setCitaSuccess(true);
      }
    } catch (err) {
      console.error('Error reserving appointment:', err);
    } finally {
      setSubmittingCita(false);
    }
  };

  if (!mounted || !prediction) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  const maxProb = Math.max(prediction.prob_ansiedad, prediction.prob_depresion);
  let statusBadge = 'Bajo Riesgo';
  let statusClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  let recommendationText = 'Tu evaluación indica un estado de bienestar emocional óptimo. Continúa manteniendo hábitos saludables y participa de los talleres de mindfulness grupales de Bienestar.';
  
  if (maxProb >= 0.75) {
    statusBadge = 'Riesgo Crítico';
    statusClass = 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse';
    recommendationText = 'Se ha identificado un nivel elevado de malestar emocional. Es de suma importancia recibir acompañamiento profesional. Te sugerimos agendar una sesión diagnóstica prioritaria con nuestro equipo de psicología a continuación.';
  } else if (maxProb >= 0.40) {
    statusBadge = 'Riesgo Moderado';
    statusClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    recommendationText = 'Presentas algunos indicadores moderados de tensión o cansancio emocional. Te recomendamos revisar nuestras guías de autoayuda cognitivo-conductual y considerar solicitar una cita de consejería preventiva.';
  }

  return (
    <div className="flex-grow flex flex-col justify-start py-6 gap-8 relative">
      <div className="glow-overlay-indigo opacity-20" />
      
      {/* Header Results Info */}
      <section className="max-w-4xl mx-auto w-full text-center relative z-10 flex flex-col items-center gap-3">
        <h2 className="text-3xl font-black text-white tracking-wide uppercase">
          Reporte Clínico de Cribado
        </h2>
        <div className="flex items-center gap-3 mt-1">
          <span className={`px-3.5 py-1 rounded-full text-xs font-bold border ${statusClass}`}>
            {statusBadge}
          </span>
          <span className="text-xs text-gray-500 font-mono">
            Ítems Evaluados: <span className="text-gray-300 font-bold">{answersCount} / 24</span>
          </span>
        </div>
      </section>

      {/* Main Gauges Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full relative z-10">
        <RiskMeter 
          probability={prediction.prob_ansiedad} 
          title="Escala de Ansiedad (CAT)" 
          subtitle="Modelado IRT de rasgo latente de ansiedad"
        />
        <RiskMeter 
          probability={prediction.prob_depresion} 
          title="Escala de Depresión (CAT)" 
          subtitle="Modelado IRT de rasgo latente de depresión"
        />
      </section>

      {/* TAC Consistency score & SHAP attributions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-4xl mx-auto w-full relative z-10">
        
        {/* Left Side: Summary and Recommendations */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Consistency card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-mono font-bold text-gray-500 uppercase">
                Consistencia TAC
              </h4>
              <p className="text-2xl font-black text-white mt-1">
                {prediction.tac_score}%
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                Control de consistencia de respuestas
              </p>
            </div>
            
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              prediction.tac_score >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
              </svg>
            </div>
          </div>

          {/* Recommendations Card */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex-grow flex flex-col gap-3">
            <h4 className="text-xs font-mono font-bold text-gray-500 uppercase">
              Recomendaciones del Especialista
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              {recommendationText}
            </p>
            {prediction.early_stop && (
              <div className="text-[10px] text-amber-400 bg-amber-500/5 border border-amber-500/15 p-2.5 rounded-lg font-semibold mt-2">
                ⚠️ Cribado finalizado anticipadamente por parada temprana CAT al alcanzar alto nivel de concordancia.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: SHAP Attribution Chart */}
        <div className="lg:col-span-2">
          <ShapChart shapValues={prediction.shap_values} />
        </div>
      </section>

      {/* Appointment Booking Panel (For High & Medium Risk) */}
      {maxProb >= 0.40 && (
        <section className="max-w-4xl mx-auto w-full relative z-10">
          <div className={`glass-panel p-8 rounded-3xl border ${
            maxProb >= 0.75 ? 'border-rose-500/20 shadow-rose-500/5' : 'border-white/5'
          } relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-rose-500/5 to-teal-500/5 blur-3xl rounded-full" />
            
            <h3 className="text-lg font-bold text-gray-100 mb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              Agendar Sesión de Apoyo Psicológico Inmediato
            </h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Reserva una cita con el equipo de Bienestar Estudiantil de tu facultad. Un profesional revisará tu reporte SHAP y definirá una guía personalizada contigo.
            </p>

            {citaSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center text-emerald-300 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7 mx-auto mb-2 text-emerald-400 animate-bounce">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
                <p className="font-bold">¡Cita Solicitada Exitosamente!</p>
                <p className="text-xs text-emerald-400/80">Un psicólogo del área se contactará a la brevedad para confirmar la fecha exacta.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="notes" className="block text-xs font-semibold text-gray-400 mb-2">
                    Notas o comentarios adicionales (Opcional)
                  </label>
                  <textarea
                    id="notes"
                    value={citasNotes}
                    onChange={(e) => setCitasNotes(e.target.value)}
                    placeholder="Escribe aquí si prefieres algún horario específico, atención virtual/presencial, o algún detalle adicional que desees compartir..."
                    rows={3}
                    className="w-full bg-gray-900 border border-white/5 focus:border-rose-500/40 rounded-xl py-3 px-4 text-xs text-gray-200 outline-none transition-all placeholder:text-gray-700"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleBookCita}
                    disabled={submittingCita}
                    className="py-3.5 px-8 bg-gradient-to-r from-rose-500 to-indigo-500 hover:from-rose-600 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-500/10 transition-all hover:scale-[1.01] flex items-center gap-2 cursor-pointer"
                  >
                    {submittingCita ? (
                      <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    ) : (
                      "Solicitar Cita de Derivación Prioritaria"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer Go Back Home */}
      <section className="max-w-4xl mx-auto w-full flex justify-center mt-4 relative z-10">
        <a
          href="/"
          className="text-xs font-semibold text-gray-400 hover:text-white transition-colors bg-white/3 border border-white/5 hover:border-white/10 px-5 py-2.5 rounded-xl cursor-pointer"
        >
          Regresar a Inicio
        </a>
      </section>
    </div>
  );
}
