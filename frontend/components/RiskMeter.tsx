// Component: RiskMeter.tsx
'use client';
import React, { useEffect, useState } from 'react';

interface RiskMeterProps {
  probability: number; // 0.0 to 1.0
  title: string;
  subtitle?: string;
}

export default function RiskMeter({ probability, title, subtitle }: RiskMeterProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.round(probability * 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  // Determine colors based on risk semáforo
  let strokeColor = 'stroke-emerald-400';
  let textColor = 'text-emerald-400';
  let glowColor = 'shadow-emerald-500/20';
  let label = 'Estable (Bajo)';
  let bgGradient = 'from-emerald-500/10 to-transparent';

  if (percentage >= 75) {
    strokeColor = 'stroke-rose-500';
    textColor = 'text-rose-400';
    glowColor = 'shadow-rose-500/20';
    label = 'Riesgo Elevado (Alto)';
    bgGradient = 'from-rose-500/10 to-transparent';
  } else if (percentage >= 40) {
    strokeColor = 'stroke-amber-400';
    textColor = 'text-amber-400';
    glowColor = 'shadow-amber-500/20';
    label = 'Riesgo Moderado (Medio)';
    bgGradient = 'from-amber-500/10 to-transparent';
  }

  // Circular calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedValue / 100) * circumference;

  return (
    <div className={`glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 hover:scale-[1.02] border border-white/5`}>
      <div className={`absolute inset-0 bg-gradient-to-b ${bgGradient} opacity-20 pointer-events-none`} />
      
      <h3 className="text-lg font-semibold text-gray-200 mb-1 z-10">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 mb-4 z-10">{subtitle}</p>}

      {/* SVG Ring Gauge */}
      <div className="relative w-36 h-36 flex items-center justify-center mb-4 z-10">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="stroke-gray-800"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Active colored circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            className={`${strokeColor} transition-all duration-1000 ease-out`}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px var(--stroke-color, currentColor))`
            }}
          />
        </svg>

        {/* Text centered inside circular meter */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-3xl font-extrabold tracking-tight ${textColor} transition-all duration-700`}>
            {animatedValue}%
          </span>
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mt-0.5">
            Probabilidad
          </span>
        </div>
      </div>

      {/* Risk Alert Tag */}
      <div className={`px-4 py-1.5 rounded-full text-xs font-semibold z-10 glass-panel flex items-center gap-1.5 border border-white/5`}>
        <span className={`w-2 h-2 rounded-full animate-pulse ${
          percentage >= 75 ? 'bg-rose-500' : percentage >= 40 ? 'bg-amber-400' : 'bg-emerald-400'
        }`} />
        <span className={textColor}>{label}</span>
      </div>
    </div>
  );
}
