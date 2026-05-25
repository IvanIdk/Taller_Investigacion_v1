// IRT CAT (Computerized Adaptive Testing) Engine for Universidad Continental
// Based on the 2-Parameter Logistic (2PL) Model

export interface IRTQuestion {
  id: number;
  text: string;
  category: 'ansiedad' | 'depresion' | 'tac';
  type: 'cat' | 'tac';
  a: number; // discrimination
  b: number; // difficulty / severity
  c: number; // guessing (usually 0 for 2PL)
  options: { text: string; value: number }[];
}

export interface UserAnswer {
  question_id: number;
  category: 'ansiedad' | 'depresion' | 'tac';
  value: number; // 0 (Nunca) to 3 (Casi todos los días)
}

// 1. Calculate response probability under 2PL model
// P(X = 1 | theta) = c + (1 - c) / (1 + exp(-a * (theta - b)))
export function getProbability(theta: number, a: number, b: number, c: number = 0.0): number {
  const e = Math.exp(-a * (theta - b));
  return c + (1.0 - c) / (1.0 + e);
}

// 2. Estimate Theta using Expected A Posteriori (EAP) with a standard Normal prior N(0, 1)
// EAP is highly stable and doesn't diverge for all-positive or all-negative response patterns.
export function estimateTheta(
  answers: UserAnswer[],
  questions: IRTQuestion[],
  category: 'ansiedad' | 'depresion'
): number {
  // Filter answers and questions for the active category
  const activeAnswers = answers.filter(ans => ans.category === category);
  if (activeAnswers.length === 0) return 0.0; // Starting theta

  // Build grid of theta values from -3.0 to 3.0 with step 0.1 (61 points)
  const gridSteps = 60;
  const minTheta = -3.0;
  const maxTheta = 3.0;
  const step = (maxTheta - minTheta) / gridSteps;
  
  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i <= gridSteps; i++) {
    const theta_k = minTheta + i * step;
    
    // Prior probability under standard normal distribution N(0, 1)
    const prior = Math.exp(-0.5 * theta_k * theta_k) / Math.sqrt(2 * Math.PI);
    
    // Likelihood calculation
    let likelihood = 1.0;
    
    for (const ans of activeAnswers) {
      const q = questions.find(item => item.id === ans.question_id);
      if (!q) continue;

      // Binarize Likert scale: response >= 2 is positive (1), <= 1 is negative (0)
      const u = ans.value >= 2 ? 1 : 0;
      const p = getProbability(theta_k, q.a, q.b, q.c);
      
      if (u === 1) {
        likelihood *= p;
      } else {
        likelihood *= (1 - p);
      }
    }
    
    const posterior_k = likelihood * prior;
    numerator += theta_k * posterior_k;
    denominator += posterior_k;
  }

  // Fallback to 0 if denominator becomes extremely small
  if (denominator < 1e-10) return 0.0;

  const estimated = numerator / denominator;
  // Bound the estimate between -3.0 and 3.0
  return Math.max(-3.0, Math.min(3.0, estimated));
}

// 3. Fisher Information of an item at a given theta
// I(theta) = a^2 * P(theta) * (1 - P(theta))  (under 2PL with c = 0)
export function getItemInformation(theta: number, a: number, b: number, c: number = 0.0): number {
  const p = getProbability(theta, a, b, c);
  // Standard Information formula
  if (c === 0.0) {
    return a * a * p * (1 - p);
  } else {
    // 3PL formula
    const num = a * a * (1 - p) * (p - c) * (p - c);
    const den = (1 - c) * (1 - c) * p;
    return den > 1e-6 ? num / den : 0.0;
  }
}

// 4. Select the next item that maximizes Fisher Information
export function selectNextItem(
  answers: UserAnswer[],
  questions: IRTQuestion[],
  category: 'ansiedad' | 'depresion',
  currentTheta: number
): IRTQuestion | null {
  // Filter questions that are in the active category, are CAT type, and NOT answered yet
  const answeredIds = new Set(answers.map(a => a.question_id));
  const candidateQuestions = questions.filter(
    q => q.category === category && q.type === 'cat' && !answeredIds.has(q.id)
  );

  if (candidateQuestions.length === 0) return null;

  let bestItem: IRTQuestion | null = null;
  let maxInfo = -1.0;

  for (const q of candidateQuestions) {
    const info = getItemInformation(currentTheta, q.a, q.b, q.c);
    if (info > maxInfo) {
      maxInfo = info;
      bestItem = q;
    }
  }

  return bestItem;
}

// 5. Check if we should insert a TAC control question
// TAC questions are interleaved: e.g. after every 4 CAT questions answered,
// we insert an unanswered TAC question to check consistency and attention.
export function selectNextTACItem(
  answers: UserAnswer[],
  questions: IRTQuestion[]
): IRTQuestion | null {
  const answeredIds = new Set(answers.map(a => a.question_id));
  const tacQuestions = questions.filter(q => q.type === 'tac' && !answeredIds.has(q.id));
  
  if (tacQuestions.length === 0) return null;
  
  // Return the first available TAC question
  return tacQuestions[0];
}

// Check if a TAC question is scheduled based on the total number of answers
export function isTACScheduled(totalAnswersCount: number): boolean {
  // Interleave TAC questions at answer counts 4, 8, 12, 16
  // This means roughly every 4 normal items, we show a control item.
  if (totalAnswersCount > 0 && totalAnswersCount % 4 === 0) {
    return true;
  }
  return false;
}
