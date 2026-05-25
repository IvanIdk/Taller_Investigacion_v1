// Page: Adaptive CAT Test (app/test/page.tsx)
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  IRTQuestion, 
  UserAnswer, 
  estimateTheta, 
  selectNextItem, 
  selectNextTACItem, 
  isTACScheduled 
} from '@/lib/cat';
import QuestionCard from '@/components/QuestionCard';

export default function TestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<IRTQuestion[]>([]);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  
  // Latent traits
  const [thetaAnsiedad, setThetaAnsiedad] = useState(0.0);
  const [thetaDepresion, setThetaDepresion] = useState(0.0);
  
  // Active state
  const [currentQuestion, setCurrentQuestion] = useState<IRTQuestion | null>(null);
  const [activeCategory, setActiveCategory] = useState<'ansiedad' | 'depresion'>('ansiedad');
  const [earlyStoppingActive, setEarlyStoppingActive] = useState(false);
  const [earlyStoppingMetric, setEarlyStoppingMetric] = useState({ category: '', value: 0 });

  // Initial Seed Fallback Questions (matches schema.sql perfectly)
  const FALLBACK_QUESTIONS: IRTQuestion[] = [
    { id: 1, text: "¿Se ha sentido nervioso/a, ansioso/a o con los nervios de punta?", category: "ansiedad", type: "cat", a: 1.8, b: -0.5, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    { id: 2, text: "¿No ha sido capaz de parar o controlar su preocupación?", category: "ansiedad", type: "cat", a: 2.2, b: 0.2, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    { id: 3, text: "¿Se ha preocupado demasiado por diferentes cosas?", category: "ansiedad", type: "cat", a: 1.5, b: -0.8, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    { id: 4, text: "¿Ha tenido dificultad para relajarse?", category: "ansiedad", type: "cat", a: 1.2, b: -0.2, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    { id: 5, text: "¿Se ha sentido tan inquieto/a que le ha sido difícil permanecer sentado/a?", category: "ansiedad", type: "cat", a: 1.4, b: 0.5, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    { id: 6, text: "¿Se ha molestado o irritado fácilmente?", category: "ansiedad", type: "cat", a: 1.0, b: -1.0, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    { id: 7, text: "¿Ha sentido miedo de que algo terrible pudiera pasar?", category: "ansiedad", type: "cat", a: 2.0, b: 1.0, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    { id: 8, text: "¿Ha tenido síntomas físicos como palpitaciones o sudoración ante la preocupación?", category: "ansiedad", type: "cat", a: 1.1, b: 0.0, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    { id: 9, text: "¿Ha evitado situaciones por miedo a sentir ansiedad?", category: "ansiedad", type: "cat", a: 1.6, b: 0.7, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    { id: 10, text: "¿Ha tenido dificultades para dormir debido a pensamientos persistentes o preocupaciones?", category: "ansiedad", type: "cat", a: 1.3, b: -0.1, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    
    { id: 11, text: "¿Ha tenido poco interés o alegría por hacer las cosas?", category: "depresion", type: "cat", a: 1.7, b: -0.4, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    { id: 12, text: "¿Se ha sentido decaído/a, deprimido/a o sin esperanzas?", category: "depresion", type: "cat", a: 2.3, b: 0.3, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    { id: 13, text: "¿Ha tenido problemas para conciliar el sueño, o para permanecer dormido/a, o ha dormido demasiado?", category: "depresion", type: "cat", a: 1.2, b: -0.7, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    { id: 14, text: "¿Se ha sentido cansado/a o con poca energía?", category: "depresion", type: "cat", a: 1.4, b: -0.9, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    { id: 15, text: "¿Ha tenido poco apetito o ha comido en exceso?", category: "depresion", type: "cat", a: 1.0, b: -0.2, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    { id: 16, text: "¿Se ha sentido mal consigo mismo/a, o ha sentido que es un fracaso, o que ha defraudado a su familia?", category: "depresion", type: "cat", a: 2.1, b: 0.8, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    { id: 17, text: "¿Ha tenido dificultad para concentrarse en cosas tales como leer el periódico o ver la televisión?", category: "depresion", type: "cat", a: 1.3, b: 0.1, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    { id: 18, text: "¿Se ha movido o hablado tan lentamente que otras personas lo han notado, o al contrario, ha estado tan inquieto/a que se ha movido mucho más de lo habitual?", category: "depresion", type: "cat", a: 1.5, b: 0.6, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    { id: 19, text: "¿Ha tenido pensamientos de que sería mejor estar muerto/a o de hacerse daño de alguna manera?", category: "depresion", type: "cat", a: 2.5, b: 1.5, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    { id: 20, text: "¿Ha sentido que la vida no tiene un propósito claro o dirección?", category: "depresion", type: "cat", a: 1.6, b: 0.2, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },

    { id: 21, text: "Pregunta de control: Por favor, seleccione la opción 'Nunca' para validar su atención.", category: "tac", type: "tac", a: 1.0, b: 0.0, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    { id: 22, text: "Pregunta de control: Por favor, marque 'Casi todos los días' para confirmar que está leyendo detenidamente.", category: "tac", type: "tac", a: 1.0, b: 0.0, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    { id: 23, text: "Pregunta de control: Seleccione 'Varios días' para continuar.", category: "tac", type: "tac", a: 1.0, b: 0.0, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] },
    { id: 24, text: "Pregunta de control: Seleccione 'Más de la mitad de los días' para verificar su concentración.", category: "tac", type: "tac", a: 1.0, b: 0.0, c: 0.0, options: [{ text: "Nunca", value: 0 }, { text: "Varios días", value: 1 }, { text: "Más de la mitad de los días", value: 2 }, { text: "Casi todos los días", value: 3 }] }
  ];

  // 1. Initial Load of Questions
  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch('/api/admin/questions');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setQuestions(data);
            setLoading(false);
            return;
          }
        }
        throw new Error('API Empty or Offline');
      } catch (err) {
        console.warn('Questions API offline, using premium fallback questions bank');
        setQuestions(FALLBACK_QUESTIONS);
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  // 2. Dynamic Question Selector (Runs when answers array updates)
  useEffect(() => {
    if (questions.length === 0) return;

    // Check if a TAC is scheduled first
    if (isTACScheduled(answers.length)) {
      const nextTAC = selectNextTACItem(answers, questions);
      if (nextTAC) {
        setCurrentQuestion(nextTAC);
        return;
      }
    }

    // Dynamic CAT item selection
    // Alternate category evaluation to gain balanced trait info
    const nextCategory = activeCategory === 'ansiedad' ? 'depresion' : 'ansiedad';
    const nextTheta = nextCategory === 'ansiedad' ? thetaAnsiedad : thetaDepresion;
    
    let nextItem = selectNextItem(answers, questions, nextCategory, nextTheta);
    
    // If nextCategory is exhausted, stick with active category
    if (!nextItem) {
      const currentTheta = activeCategory === 'ansiedad' ? thetaAnsiedad : thetaDepresion;
      nextItem = selectNextItem(answers, questions, activeCategory, currentTheta);
    } else {
      setActiveCategory(nextCategory);
    }

    // If both are exhausted, we are fully complete
    if (!nextItem) {
      handleTestFinished(answers, true);
    } else {
      setCurrentQuestion(nextItem);
    }
  }, [answers, questions]);

  // 3. Handle answer registration
  const handleAnswerSubmit = async (val: number) => {
    if (!currentQuestion) return;

    const newAnswer: UserAnswer = {
      question_id: currentQuestion.id,
      category: currentQuestion.category,
      value: val
    };

    const updatedAnswers = [...answers, newAnswer];

    // Recalculate Theta locally for EAP trait update
    if (currentQuestion.type === 'cat') {
      const activeCat = currentQuestion.category as 'ansiedad' | 'depresion';
      const newTheta = estimateTheta(updatedAnswers, questions, activeCat);
      
      if (activeCat === 'ansiedad') {
        setThetaAnsiedad(newTheta);
      } else {
        setThetaDepresion(newTheta);
      }
    }

    // Call Predict API route to update probabilities in real time & assess early stopping
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: updatedAnswers,
          user_id: localStorage.getItem('demo_user_id'),
          is_completed: false
        })
      });

      if (res.ok) {
        const pred = await res.json();
        
        // Trigger early stopping alert if threshold crossed
        if (pred.early_stop) {
          setEarlyStoppingActive(true);
          const highestCategory = pred.prob_ansiedad >= 0.95 ? 'Ansiedad' : 'Depresión';
          const highestVal = Math.round(Math.max(pred.prob_ansiedad, pred.prob_depresion) * 100);
          
          setEarlyStoppingMetric({ category: highestCategory, value: highestVal });
          
          // Delay to show beautiful transition animation
          setTimeout(() => {
            // Save state and redirect
            localStorage.setItem('last_prediction', JSON.stringify(pred));
            localStorage.setItem('last_answers_count', String(updatedAnswers.length));
            router.push('/resultados');
          }, 3500);
          return;
        }

        // Check if fully finished (reached end of all questions)
        const allCatQuestionsCount = questions.filter(q => q.type === 'cat').length;
        const currentAnsweredCatCount = updatedAnswers.filter(a => a.category !== 'tac').length;
        
        if (currentAnsweredCatCount >= allCatQuestionsCount) {
          handleTestFinished(updatedAnswers, true, pred);
          return;
        }
      }
    } catch (err) {
      console.error('Prediction API Route call failed:', err);
    }

    // Set answers to trigger next item selection loop
    setAnswers(updatedAnswers);
  };

  // 4. Force early stop manually or complete
  const handleTestFinished = async (finalAnswers: UserAnswer[], isFull = false, existingPred = null) => {
    setLoading(true);
    let predData = existingPred;

    if (!predData) {
      try {
        const res = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers: finalAnswers,
            user_id: localStorage.getItem('demo_user_id'),
            is_completed: true
          })
        });
        if (res.ok) {
          predData = await res.json();
        }
      } catch (err) {
        console.error('Final prediction call failed:', err);
      }
    }

    if (predData) {
      localStorage.setItem('last_prediction', JSON.stringify(predData));
    }
    localStorage.setItem('last_answers_count', String(finalAnswers.length));
    router.push('/resultados');
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-teal-500/20 border-t-teal-400 animate-spin" />
        <p className="text-sm text-gray-400">Iniciando motor de adaptabilidad psicométrica (CAT)...</p>
      </div>
    );
  }

  // Render Early Stopping Transitional Splash Screen
  if (earlyStoppingActive) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[70vh] text-center relative overflow-hidden">
        <div className="glow-overlay-indigo opacity-40 animate-pulse" />
        
        <div className="glass-panel p-10 rounded-3xl border border-rose-500/30 max-w-lg relative z-10 animate-float">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-6 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-rose-400 animate-pulse">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-black text-rose-400 tracking-wide mb-3 uppercase">
            Parada Temprana Activada
          </h2>
          <p className="text-sm text-gray-200 font-bold mb-4">
            El cribado adaptativo ha concluido con éxito.
          </p>
          <p className="text-xs text-gray-400 leading-relaxed mb-6">
            Para evitar la fatiga innecesaria de respuesta, el algoritmo de parada temprana se activó debido a una estimación de probabilidad de <span className="text-rose-400 font-bold">{earlyStoppingMetric.category} ({earlyStoppingMetric.value}%)</span> con un 95% de confianza clínica.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-teal-400">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            Generando atribuciones SHAP...
          </div>
        </div>
      </div>
    );
  }

  // Render normal testing card
  return (
    <div className="flex-grow flex flex-col justify-start py-8 gap-8 relative">
      <div className="absolute top-0 left-0 w-3/4 h-60 bg-gradient-to-r from-indigo-500/5 to-teal-500/5 blur-3xl rounded-full" />
      
      {/* Test Progress Info Header */}
      <div className="max-w-2xl mx-auto w-full flex items-center justify-between px-2 text-xs text-gray-400 font-semibold relative z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span>Test en Progreso</span>
        </div>
        <div>
          <span>Preguntas Respondidas: </span>
          <span className="font-mono text-white font-extrabold">{answers.length}</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="max-w-2xl mx-auto w-full h-2.5 bg-gray-900 rounded-full overflow-hidden border border-white/5 relative z-10">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-teal-500 to-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${Math.min((answers.length / 24) * 100, 100)}%` }}
        />
      </div>

      {/* Question Card component */}
      {currentQuestion && (
        <div className="relative z-10 animate-fade-in">
          <QuestionCard
            question={currentQuestion}
            questionNumber={answers.length + 1}
            onAnswer={handleAnswerSubmit}
          />
        </div>
      )}

      {/* Safety Force Finish button */}
      {answers.length >= 2 && (
        <div className="max-w-2xl mx-auto w-full flex justify-center mt-4 relative z-10">
          <button
            onClick={() => handleTestFinished(answers, false)}
            className="text-xs font-semibold text-gray-500 hover:text-rose-400 transition-colors bg-white/2 hover:bg-rose-500/5 border border-white/5 hover:border-rose-500/10 px-4 py-2 rounded-xl cursor-pointer"
          >
            Finalizar Test Ahora (Cálculo Parcial)
          </button>
        </div>
      )}
    </div>
  );
}
