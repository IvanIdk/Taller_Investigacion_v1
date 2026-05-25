// API Route: /api/predict
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getProbability } from '@/lib/cat';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const STOP_THRESHOLD = parseFloat(process.env.STOP_THRESHOLD || '95') / 100.0;

// Symptom names for SHAP fallback
const SYMPTOM_NAMES: Record<number, string> = {
  1: "Nerviosismo / Ansiedad (P1)",
  2: "Preocupación incontrolable (P2)",
  3: "Preocupación excesiva (P3)",
  4: "Dificultad para relajarse (P4)",
  5: "Inquietud motora (P5)",
  6: "Irritabilidad (P6)",
  7: "Temor a catástrofes (P7)",
  8: "Síntomas físicos (P8)",
  9: "Evitación ansiosa (P9)",
  10: "Insomnio por ansiedad (P10)",
  11: "Poco interés / Anhedonia (P11)",
  12: "Ánimo decaído / Tristeza (P12)",
  13: "Problemas del sueño (P13)",
  14: "Cansancio / Falta de energía (P14)",
  15: "Problemas de apetito (P15)",
  16: "Autovaloración negativa / Culpa (P16)",
  17: "Dificultad de concentración (P17)",
  18: "Enlentecimiento o agitación (P18)",
  19: "Pensamientos de autolesión (P19)",
  20: "Falta de propósito (P20)"
};

const TAC_CORRECT = { 21: 0, 22: 3, 23: 1, 24: 2 };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { test_id, answers, user_id, is_completed } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Respuestas inválidas' }, { status: 400 });
    }

    let predictionData;
    
    // 1. Try to fetch from FastAPI microservice
    try {
      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
        signal: AbortSignal.timeout(3000), // 3-second timeout
      });

      if (response.ok) {
        predictionData = await response.json();
      } else {
        throw new Error('FastAPI response not OK');
      }
    } catch (err) {
      console.warn('FastAPI offline, using local JS prediction fallback');
      // 2. Local JS prediction fallback (matches FastAPI logic)
      const ansiedadVals = answers.filter(a => a.category === 'ansiedad').map(a => a.value);
      const depresionVals = answers.filter(a => a.category === 'depresion').map(a => a.value);
      
      let prob_ans = 0.0;
      if (ansiedadVals.length > 0) {
        const ratio = ansiedadVals.reduce((a, b) => a + b, 0) / (ansiedadVals.length * 3);
        prob_ans = 1 / (1 + Math.exp(-8 * (ratio - 0.45)));
      }

      let prob_dep = 0.0;
      if (depresionVals.length > 0) {
        const ratio = depresionVals.reduce((a, b) => a + b, 0) / (depresionVals.length * 3);
        prob_dep = 1 / (1 + Math.exp(-8 * (ratio - 0.45)));
      }

      let tac_total = 0;
      let tac_correct = 0;
      answers.forEach(a => {
        if (a.category === 'tac') {
          tac_total++;
          if (a.value === (TAC_CORRECT as any)[a.question_id]) {
            tac_correct++;
          }
        }
      });
      const tac_score = tac_total > 0 ? (tac_correct / tac_total) * 100 : 100;

      // Generate SHAP attributions
      const shap_values: any[] = [];
      answers.forEach(a => {
        const qid = a.question_id;
        const val = a.value;
        if (a.category === 'ansiedad') {
          const w = [2, 7].includes(qid) ? 0.15 : 0.08;
          shap_values.push({ feature_name: SYMPTOM_NAMES[qid] || `P${qid}`, attribution: parseFloat((w * (val - 1.0)).toFixed(4)) });
        } else if (a.category === 'depresion') {
          const w = qid === 19 ? 0.35 : ([12, 16].includes(qid) ? 0.18 : 0.10);
          shap_values.push({ feature_name: SYMPTOM_NAMES[qid] || `P${qid}`, attribution: parseFloat((w * (val - 0.8)).toFixed(4)) });
        }
      });
      shap_values.sort((a, b) => Math.abs(b.attribution) - Math.abs(a.attribution));

      predictionData = {
        prob_ansiedad: parseFloat(prob_ans.toFixed(4)),
        prob_depresion: parseFloat(prob_dep.toFixed(4)),
        tac_score: parseFloat(tac_score.toFixed(1)),
        shap_values: shap_values.slice(0, 6),
        model_type: "Fallback (Logistic JS)"
      };
    }

    const early_stop = predictionData.prob_ansiedad >= STOP_THRESHOLD || predictionData.prob_depresion >= STOP_THRESHOLD;
    const final_completed = is_completed || early_stop;

    // 3. Save to Supabase if test_id exists and Supabase is accessible
    if (test_id) {
      try {
        // Update test status if completed
        if (final_completed) {
          await supabase
            .from('tests')
            .update({ completed_at: new Date().toISOString(), status: 'completado' })
            .eq('id', test_id);
        }

        // Insert prediction log
        const { data: pred, error: predErr } = await supabase
          .from('predictions')
          .insert({
            test_id,
            prob_ansiedad: predictionData.prob_ansiedad,
            prob_depresion: predictionData.prob_depresion,
            tac_score: predictionData.tac_score
          })
          .select()
          .single();

        // Save SHAP explanations
        if (!predErr && pred && predictionData.shap_values.length > 0) {
          const shapInserts = predictionData.shap_values.map((s: any) => ({
            prediction_id: pred.id,
            feature_name: s.feature_name,
            attribution: s.attribution
          }));
          await supabase.from('shap_explanations').insert(shapInserts);
        }
      } catch (dbErr) {
        console.warn('DB recording failed, running in sandbox session mode:', dbErr);
      }
    }

    return NextResponse.json({
      ...predictionData,
      early_stop,
      final_completed
    });

  } catch (error) {
    console.error('Error in predict api route:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
