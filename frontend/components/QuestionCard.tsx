// Component: QuestionCard.tsx
'use client';
import React, { useState } from 'react';
import { IRTQuestion } from '@/lib/cat';

interface QuestionCardProps {
  question: IRTQuestion;
  onAnswer: (value: number) => void;
  questionNumber: number;
}

export default function QuestionCard({ question, onAnswer, questionNumber }: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Category specific styles
  let badgeText = 'Ansiedad';
  let badgeColor = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
  let glowBorder = 'focus-within:border-indigo-500/40 hover:border-indigo-500/20';
  let activeOptionBg = 'bg-indigo-600 border-indigo-400 text-white';

  if (question.category === 'depresion') {
    badgeText = 'Depresión';
    badgeColor = 'bg-teal-500/10 text-teal-300 border-teal-500/20';
    glowBorder = 'focus-within:border-teal-500/40 hover:border-teal-500/20';
    activeOptionBg = 'bg-teal-600 border-teal-400 text-white';
  } else if (question.category === 'tac') {
    badgeText = 'Control de Atención';
    badgeColor = 'bg-amber-500/10 text-amber-300 border-amber-500/20';
    glowBorder = 'focus-within:border-amber-500/40 hover:border-amber-500/20';
    activeOptionBg = 'bg-amber-600 border-amber-400 text-white';
  }

  const handleSelect = (val: number) => {
    setSelectedOption(val);
  };

  const handleSubmit = () => {
    if (selectedOption !== null) {
      onAnswer(selectedOption);
      setSelectedOption(null); // Reset for next question
    }
  };

  return (
    <div className={`glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden transition-all duration-300 ${glowBorder} shadow-xl shadow-black/40 max-w-2xl mx-auto`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
      
      {/* Card Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <span className="text-xs font-mono font-bold text-gray-500 bg-white/2 px-2.5 py-1 rounded-md border border-white/5">
          PREGUNTA N° {questionNumber}
        </span>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badgeColor}`}>
          {badgeText}
        </span>
      </div>

      {/* Question Text */}
      <h2 className="text-xl md:text-2xl font-bold text-gray-100 mb-8 leading-relaxed relative z-10">
        {question.text}
      </h2>

      {/* Options Stack */}
      <div className="space-y-3.5 mb-8 relative z-10">
        {(question.options || [
          { text: "Nunca", value: 0 },
          { text: "Varios días", value: 1 },
          { text: "Más de la mitad de los días", value: 2 },
          { text: "Casi todos los días", value: 3 }
        ]).map((opt) => {
          const isSelected = selectedOption === opt.value;
          
          return (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`w-full text-left p-4.5 rounded-2xl border text-sm md:text-base font-semibold transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                isSelected 
                  ? `${activeOptionBg} shadow-lg` 
                  : 'bg-white/2 border-white/5 hover:border-white/15 hover:bg-white/4 text-gray-300 hover:text-white'
              }`}
            >
              <span>{opt.text}</span>
              
              {/* Option Radio Dot */}
              <span className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                isSelected 
                  ? 'border-white bg-white' 
                  : 'border-gray-600 group-hover:border-gray-400'
              }`}>
                {isSelected && (
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    question.category === 'depresion' ? 'bg-teal-600' : question.category === 'tac' ? 'bg-amber-600' : 'bg-indigo-600'
                  }`} />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action Footer */}
      <div className="flex justify-end relative z-10">
        <button
          onClick={handleSubmit}
          disabled={selectedOption === null}
          className={`px-8 py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 flex items-center gap-2 cursor-pointer ${
            selectedOption !== null
              ? 'bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02]'
              : 'bg-gray-800 border border-white/5 text-gray-500 cursor-not-allowed'
          }`}
        >
          Siguiente Pregunta
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
