// API Route: /api/admin/questions
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_OPTIONS = [
  { text: "Nunca", value: 0 },
  { text: "Varios días", value: 1 },
  { text: "Más de la mitad de los días", value: 2 },
  { text: "Casi todos los días", value: 3 }
];

// Persistent in-memory mock bank of questions for admin CRUD demo
const MOCK_QUESTIONS = [
  { id: 1, text: "¿Se ha sentido nervioso/a, ansioso/a o con los nervios de punta?", category: "ansiedad", type: "cat", a: 1.8, b: -0.5, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  { id: 2, text: "¿No ha sido capaz de parar o controlar su preocupación?", category: "ansiedad", type: "cat", a: 2.2, b: 0.2, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  { id: 3, text: "¿Se ha preocupado demasiado por diferentes cosas?", category: "ansiedad", type: "cat", a: 1.5, b: -0.8, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  { id: 4, text: "¿Ha tenido dificultad para relajarse?", category: "ansiedad", type: "cat", a: 1.2, b: -0.2, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  { id: 5, text: "¿Se ha sentido tan inquieto/a que le ha sido difícil permanecer sentado/a?", category: "ansiedad", type: "cat", a: 1.4, b: 0.5, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  { id: 6, text: "¿Se ha molestado o irritado fácilmente?", category: "ansiedad", type: "cat", a: 1.0, b: -1.0, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  { id: 7, text: "¿Ha sentido miedo de que algo terrible pudiera pasar?", category: "ansiedad", type: "cat", a: 2.0, b: 1.0, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  { id: 8, text: "¿Ha tenido síntomas físicos como palpitaciones o sudoración ante la preocupación?", category: "ansiedad", type: "cat", a: 1.1, b: 0.0, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  { id: 9, text: "¿Ha evitado situaciones por miedo a sentir ansiedad?", category: "ansiedad", type: "cat", a: 1.6, b: 0.7, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  { id: 10, text: "¿Ha tenido dificultades para dormir debido a pensamientos de preocupación?", category: "ansiedad", type: "cat", a: 1.3, b: -0.1, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  
  { id: 11, text: "¿Ha tenido poco interés o alegría por hacer las cosas?", category: "depresion", type: "cat", a: 1.7, b: -0.4, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  { id: 12, text: "¿Se ha sentido decaído/a, deprimido/a o sin esperanzas?", category: "depresion", type: "cat", a: 2.3, b: 0.3, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  { id: 13, text: "¿Ha tenido problemas para conciliar el sueño o dormir demasiado?", category: "depresion", type: "cat", a: 1.2, b: -0.7, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  { id: 14, text: "¿Se ha sentido cansado/a o con poca energía?", category: "depresion", type: "cat", a: 1.4, b: -0.9, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  { id: 15, text: "¿Ha tenido poco apetito o ha comido en exceso?", category: "depresion", type: "cat", a: 1.0, b: -0.2, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  { id: 16, text: "¿Se ha sentido mal consigo mismo/a, o que es un fracaso?", category: "depresion", type: "cat", a: 2.1, b: 0.8, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  { id: 17, text: "¿Ha tenido dificultad para concentrarse en sus actividades cotidianas?", category: "depresion", type: "cat", a: 1.3, b: 0.1, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  { id: 18, text: "¿Se ha movido o hablado tan lentamente que otros lo notaron?", category: "depresion", type: "cat", a: 1.5, b: 0.6, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  { id: 19, text: "¿Ha tenido pensamientos de que sería mejor estar muerto/a o autolesionarse?", category: "depresion", type: "cat", a: 2.5, b: 1.5, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  { id: 20, text: "¿Ha sentido que la vida no tiene un propósito claro?", category: "depresion", type: "cat", a: 1.6, b: 0.2, c: 0.0, active: true, options: DEFAULT_OPTIONS },

  { id: 21, text: "Pregunta de control: Por favor, seleccione la opción 'Nunca' para validar su atención.", category: "tac", type: "tac", a: 1.0, b: 0.0, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  { id: 22, text: "Pregunta de control: Por favor, marque 'Casi todos los días' para confirmar que lee detenidamente.", category: "tac", type: "tac", a: 1.0, b: 0.0, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  { id: 23, text: "Pregunta de control: Seleccione 'Varios días' para continuar.", category: "tac", type: "tac", a: 1.0, b: 0.0, c: 0.0, active: true, options: DEFAULT_OPTIONS },
  { id: 24, text: "Pregunta de control: Seleccione 'Más de la mitad de los días' para verificar su concentración.", category: "tac", type: "tac", a: 1.0, b: 0.0, c: 0.0, active: true, options: DEFAULT_OPTIONS }
];

export async function GET(req: Request) {
  try {
    try {
      // Fetch questions and parameters joined
      const { data: questions, error: qErr } = await supabase
        .from('questions')
        .select('*, cat_parameters(a, b, c)');

      if (qErr || !questions || questions.length === 0) throw new Error('No questions in DB');

      const formatted = questions.map(q => {
        const params = q.cat_parameters as any;
        return {
          id: q.id,
          text: q.text,
          category: q.category,
          type: q.type,
          a: params ? params.a : 1.0,
          b: params ? params.b : 0.0,
          c: params ? params.c : 0.0,
          active: q.active,
          options: q.options || DEFAULT_OPTIONS
        };
      });

      return NextResponse.json(formatted);

    } catch (dbErr) {
      // Fallback
      return NextResponse.json(MOCK_QUESTIONS);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar banco de preguntas' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, category, type, a, b, c, active } = body;

    if (!text || !category || !type) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    try {
      const options = [
        { text: "Nunca", value: 0 },
        { text: "Varios días", value: 1 },
        { text: "Más de la mitad de los días", value: 2 },
        { text: "Casi todos los días", value: 3 }
      ];

      const { data: question, error: qErr } = await supabase
        .from('questions')
        .insert({ text, category, type, options, active: active ?? true })
        .select()
        .single();

      if (qErr || !question) throw qErr;

      // If CAT, insert parameters
      if (type === 'cat') {
        await supabase
          .from('cat_parameters')
          .insert({ question_id: question.id, a: a ?? 1.0, b: b ?? 0.0, c: c ?? 0.0 });
      }

      return NextResponse.json({
        id: question.id,
        text, category, type, a, b, c, active: question.active
      });

    } catch (dbErr) {
      // Fallback
      const newId = MOCK_QUESTIONS.reduce((max, q) => q.id > max ? q.id : max, 0) + 1;
      const newQ = { id: newId, text, category, type, a: a ?? 1.0, b: b ?? 0.0, c: c ?? 0.0, active: active ?? true, options: DEFAULT_OPTIONS };
      MOCK_QUESTIONS.push(newQ);
      return NextResponse.json(newQ);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar pregunta' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, text, category, type, a, b, c, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID es obligatorio' }, { status: 400 });
    }

    try {
      const { data: question, error: qErr } = await supabase
        .from('questions')
        .update({ text, category, type, active })
        .eq('id', id)
        .select()
        .single();

      if (qErr) throw qErr;

      if (type === 'cat') {
        await supabase
          .from('cat_parameters')
          .upsert({ question_id: id, a, b, c });
      }

      return NextResponse.json({ id, text, category, type, a, b, c, active });

    } catch (dbErr) {
      // Fallback
      const idx = MOCK_QUESTIONS.findIndex(q => q.id === id);
      if (idx !== -1) {
        MOCK_QUESTIONS[idx] = {
          ...MOCK_QUESTIONS[idx],
          text: text !== undefined ? text : MOCK_QUESTIONS[idx].text,
          category: category !== undefined ? category : MOCK_QUESTIONS[idx].category,
          type: type !== undefined ? type : MOCK_QUESTIONS[idx].type,
          a: a !== undefined ? a : MOCK_QUESTIONS[idx].a,
          b: b !== undefined ? b : MOCK_QUESTIONS[idx].b,
          c: c !== undefined ? c : MOCK_QUESTIONS[idx].c,
          active: active !== undefined ? active : MOCK_QUESTIONS[idx].active
        };
        return NextResponse.json(MOCK_QUESTIONS[idx]);
      }
      return NextResponse.json({ error: 'Pregunta no encontrada' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar pregunta' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get('id') || '');

    if (!id) {
      return NextResponse.json({ error: 'ID es obligatorio' }, { status: 400 });
    }

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return NextResponse.json({ success: true, id });

    } catch (dbErr) {
      // Fallback
      const idx = MOCK_QUESTIONS.findIndex(q => q.id === id);
      if (idx !== -1) {
        MOCK_QUESTIONS.splice(idx, 1);
        return NextResponse.json({ success: true, id });
      }
      return NextResponse.json({ error: 'Pregunta no encontrada' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar pregunta' }, { status: 500 });
  }
}
