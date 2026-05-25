// Component: ShapChart.tsx
'use client';
import React from 'react';

interface ShapItem {
  feature_name: string;
  attribution: number; // e.g. -0.15 to +0.35
}

interface ShapChartProps {
  shapValues: ShapItem[];
}

export default function ShapChart({ shapValues }: ShapChartProps) {
  if (!shapValues || shapValues.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-white/5 text-center text-gray-400 py-12">
        <p className="text-sm">Se necesitan responder preguntas adaptativas para generar el análisis explicativo SHAP.</p>
      </div>
    );
  }

  // Find max absolute attribution to scale the bars proportionally
  const maxAbs = Math.max(...shapValues.map(item => Math.abs(item.attribution)), 0.1);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-200">Explicación del Modelo (SHAP)</h3>
          <p className="text-xs text-gray-400">Atribución de impacto individual de cada síntoma en la predicción final</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shadow-md shadow-rose-500/40" />
            <span>Incrementa Riesgo</span>
          </div>
          <div className="flex items-center gap-1.5 text-teal-400">
            <span className="w-2.5 h-2.5 rounded-sm bg-teal-500 shadow-md shadow-teal-500/40" />
            <span>Reduce Riesgo</span>
          </div>
        </div>
      </div>

      <div className="space-y-4.5 relative z-10">
        {shapValues.map((item, index) => {
          const isPositive = item.attribution >= 0;
          const percentage = Math.min((Math.abs(item.attribution) / maxAbs) * 100, 100);
          
          // Style classes
          const barColor = isPositive 
            ? 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-lg shadow-rose-500/20' 
            : 'bg-gradient-to-l from-teal-600 to-teal-400 shadow-lg shadow-teal-500/20';
            
          const txtColor = isPositive ? 'text-rose-400' : 'text-teal-400';
          const sign = isPositive ? '+' : '';

          return (
            <div key={index} className="group flex flex-col md:flex-row md:items-center justify-between gap-2 p-2.5 rounded-lg hover:bg-white/3 transition-colors duration-200">
              {/* Feature/Symptom Name */}
              <div className="md:w-5/12">
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                  {item.feature_name}
                </span>
              </div>

              {/* Bidirectional Bar Wrapper */}
              <div className="flex-1 flex items-center gap-3 relative">
                {/* Left side (Negative impact) */}
                <div className="w-1/2 flex justify-end h-3 bg-gray-900/60 rounded-l overflow-hidden border-y border-l border-white/5 relative">
                  {!isPositive && (
                    <div 
                      className={`h-full ${barColor} rounded-l transition-all duration-1000 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                </div>

                {/* Vertical Center Anchor (0.0 line) */}
                <div className="w-[2px] h-5 bg-gray-600 relative z-20">
                  <div className="absolute -top-1.5 -left-1 text-[8px] font-bold text-gray-500">0.0</div>
                </div>

                {/* Right side (Positive impact) */}
                <div className="w-1/2 flex justify-start h-3 bg-gray-900/60 rounded-r overflow-hidden border-y border-r border-white/5 relative">
                  {isPositive && (
                    <div 
                      className={`h-full ${barColor} rounded-r transition-all duration-1000 ease-out`}
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                </div>
              </div>

              {/* Attribution Value Badge */}
              <div className="md:w-1.5/12 text-right">
                <span className={`text-xs font-mono font-bold ${txtColor} bg-white/2 px-2 py-0.5 rounded border border-white/5`}>
                  {sign}{item.attribution.toFixed(3)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 text-[10px] text-gray-500 border-t border-white/5 pt-3 text-center">
        Los valores SHAP estiman el impacto del modelo aditivo. Atribuciones superiores a +0.15 se consideran factores altamente críticos que justifican intervención inmediata de bienestar.
      </div>
    </div>
  );
}
