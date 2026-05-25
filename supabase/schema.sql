-- Schema for Diagnóstico Predictivo - Universidad Continental

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

-- Insert standard roles
INSERT INTO public.roles (nombre) VALUES ('admin') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO public.roles (nombre) VALUES ('psicologo') ON CONFLICT (nombre) DO NOTHING;
INSERT INTO public.roles (nombre) VALUES ('estudiante') ON CONFLICT (nombre) DO NOTHING;

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    facultad VARCHAR(100),
    carrera VARCHAR(100),
    edad INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create user_roles join table
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id INT REFERENCES public.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'ansiedad', 'depresion', 'tac' (attention check)
    type VARCHAR(50) NOT NULL,     -- 'cat', 'tac'
    options JSONB NOT NULL,        -- [{"text": "Nunca", "value": 0}, ...]
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create cat_parameters table
CREATE TABLE IF NOT EXISTS public.cat_parameters (
    question_id INT PRIMARY KEY REFERENCES public.questions(id) ON DELETE CASCADE,
    a FLOAT NOT NULL DEFAULT 1.0, -- discrimination
    b FLOAT NOT NULL DEFAULT 0.0, -- difficulty
    c FLOAT NOT NULL DEFAULT 0.0  -- guessing
);

-- Create tests table
CREATE TABLE IF NOT EXISTS public.tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for anonymous tests
    started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'en_progreso' NOT NULL -- 'en_progreso', 'completado'
);

-- Create answers table
CREATE TABLE IF NOT EXISTS public.answers (
    id SERIAL PRIMARY KEY,
    test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE NOT NULL,
    question_id INT REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    response_value INT NOT NULL,
    theta_estimate_after FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create predictions table
CREATE TABLE IF NOT EXISTS public.predictions (
    id SERIAL PRIMARY KEY,
    test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE UNIQUE NOT NULL,
    prob_ansiedad FLOAT NOT NULL,
    prob_depresion FLOAT NOT NULL,
    tac_score FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create shap_explanations table
CREATE TABLE IF NOT EXISTS public.shap_explanations (
    id SERIAL PRIMARY KEY,
    prediction_id INT REFERENCES public.predictions(id) ON DELETE CASCADE NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    attribution FLOAT NOT NULL
);

-- Create citas table
CREATE TABLE IF NOT EXISTS public.citas (
    id SERIAL PRIMARY KEY,
    estudiante_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    psicologo_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    fecha TIMESTAMP WITH TIME ZONE NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente' NOT NULL, -- 'pendiente', 'confirmada', 'realizada', 'cancelada'
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name VARCHAR(50),
    row_id TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Seed static questions and parameters
-- Inserting 24 questions (10 Anxiety, 10 Depression, 4 TAC)
-- Anxiety items: Generalized anxiety symptoms (e.g. GAD-7 style)
-- Depression items: Depressive symptoms (e.g. PHQ-9 style)
-- TAC items: Attention check items

-- Let's define the standard Options JSON:
-- [{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]
-- For TAC, specific instructions will be in the text: e.g. "Por favor, seleccione 'Nunca' para esta pregunta."

-- TRUNCATE first to avoid conflicts in demo reload
TRUNCATE public.questions CASCADE;

-- Insert Questions
INSERT INTO public.questions (id, text, category, type, options) VALUES
(1, '¿Se ha sentido nervioso/a, ansioso/a o con los nervios de punta?', 'ansiedad', 'cat', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),
(2, '¿No ha sido capaz de parar o controlar su preocupación?', 'ansiedad', 'cat', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),
(3, '¿Se ha preocupado demasiado por diferentes cosas?', 'ansiedad', 'cat', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),
(4, '¿Ha tenido dificultad para relajarse?', 'ansiedad', 'cat', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),
(5, '¿Se ha sentido tan inquieto/a que le ha sido difícil permanecer sentado/a?', 'ansiedad', 'cat', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),
(6, '¿Se ha molestado o irritado fácilmente?', 'ansiedad', 'cat', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),
(7, '¿Ha sentido miedo de que algo terrible pudiera pasar?', 'ansiedad', 'cat', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),
(8, '¿Ha tenido síntomas físicos como palpitaciones o sudoración ante la preocupación?', 'ansiedad', 'cat', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),
(9, '¿Ha evitado situaciones por miedo a sentir ansiedad?', 'ansiedad', 'cat', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),
(10, '¿Ha tenido dificultades para dormir debido a pensamientos persistentes o preocupaciones?', 'ansiedad', 'cat', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),

(11, '¿Ha tenido poco interés o alegría por hacer las cosas?', 'depresion', 'cat', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),
(12, '¿Se ha sentido decaído/a, deprimido/a o sin esperanzas?', 'depresion', 'cat', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),
(13, '¿Ha tenido problemas para conciliar el sueño, o para permanecer dormido/a, o ha dormido demasiado?', 'depresion', 'cat', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),
(14, '¿Se ha sentido cansado/a o con poca energía?', 'depresion', 'cat', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),
(15, '¿Ha tenido poco apetito o ha comido en exceso?', 'depresion', 'cat', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),
(16, '¿Se ha sentido mal consigo mismo/a, o ha sentido que es un fracaso, o que ha defraudado a su familia?', 'depresion', 'cat', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),
(17, '¿Ha tenido dificultad para concentrarse en cosas tales como leer el periódico o ver la televisión?', 'depresion', 'cat', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),
(18, '¿Se ha movido o hablado tan lentamente que otras personas lo han notado, o al contrario, ha estado tan inquieto/a que se ha movido mucho más de lo habitual?', 'depresion', 'cat', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),
(19, '¿Ha tenido pensamientos de que sería mejor estar muerto/a o de hacerse daño de alguna manera?', 'depresion', 'cat', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),
(20, '¿Ha sentido que la vida no tiene un propósito claro o dirección?', 'depresion', 'cat', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),

-- TAC Questions
(21, 'Pregunta de control: Por favor, seleccione la opción "Nunca" para validar su atención.', 'tac', 'tac', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),
(22, 'Pregunta de control: Por favor, marque "Casi todos los días" para confirmar que está leyendo detenidamente.', 'tac', 'tac', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),
(23, 'Pregunta de control: Seleccione "Varios días" para continuar.', 'tac', 'tac', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb),
(24, 'Pregunta de control: Seleccione "Más de la mitad de los días" para verificar su concentración.', 'tac', 'tac', '[{"text": "Nunca", "value": 0}, {"text": "Varios días", "value": 1}, {"text": "Más de la mitad de los días", "value": 2}, {"text": "Casi todos los días", "value": 3}]'::jsonb);

-- Insert CAT IRT Parameters (a: discrimination [0.5, 2.5], b: difficulty/severity [-2.0, 2.0])
INSERT INTO public.cat_parameters (question_id, a, b, c) VALUES
(1, 1.8, -0.5, 0.0),
(2, 2.2, 0.2, 0.0),
(3, 1.5, -0.8, 0.0),
(4, 1.2, -0.2, 0.0),
(5, 1.4, 0.5, 0.0),
(6, 1.0, -1.0, 0.0),
(7, 2.0, 1.0, 0.0),
(8, 1.1, 0.0, 0.0),
(9, 1.6, 0.7, 0.0),
(10, 1.3, -0.1, 0.0),
(11, 1.7, -0.4, 0.0),
(12, 2.3, 0.3, 0.0),
(13, 1.2, -0.7, 0.0),
(14, 1.4, -0.9, 0.0),
(15, 1.0, -0.2, 0.0),
(16, 2.1, 0.8, 0.0),
(17, 1.3, 0.1, 0.0),
(18, 1.5, 0.6, 0.0),
(19, 2.5, 1.5, 0.0),
(20, 1.6, 0.2, 0.0);
-- TAC items do not need IRT parameters (they are scored separately)

-- CREATE TRIGGERS & RLS SECURITY POLICIES

-- Trigger to create profile and assign default student role upon auth.user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    role_id_var INT;
    email_domain TEXT;
    target_role TEXT;
BEGIN
    -- Extract domain from email
    email_domain := split_part(new.email, '@', 2);
    
    -- Check if email matches special domain (psicologo)
    -- In demo context, if it's 'continental.edu.pe' or 'psicologo@' then assign 'psicologo'
    IF email_domain = 'continental.edu.pe' THEN
        target_role := 'psicologo';
    ELSIF new.email LIKE 'admin%' THEN
        target_role := 'admin';
    ELSE
        target_role := 'estudiante';
    END IF;

    -- Create profile row
    INSERT INTO public.profiles (id, email, nombre, apellido, facultad, carrera, edad)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'nombre', 'Usuario'),
        COALESCE(new.raw_user_meta_data->>'apellido', 'Demo'),
        COALESCE(new.raw_user_meta_data->>'facultad', 'Ingeniería'),
        COALESCE(new.raw_user_meta_data->>'carrera', 'Ingeniería de Sistemas'),
        COALESCE((new.raw_user_meta_data->>'edad')::integer, 20)
    );

    -- Find the role ID
    SELECT id INTO role_id_var FROM public.roles WHERE nombre = target_role;
    
    -- Fallback to estudiante if role not found
    IF role_id_var IS NULL THEN
        SELECT id INTO role_id_var FROM public.roles WHERE nombre = 'estudiante';
    END IF;

    -- Insert into user_roles
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (new.id, role_id_var);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cat_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shap_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- HELPER FUNCTIONS FOR POLICIES

-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = user_uuid AND r.nombre = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is psicologo
CREATE OR REPLACE FUNCTION public.is_psicologo(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.id
        WHERE ur.user_id = user_uuid AND r.nombre = 'psicologo'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RLS POLICIES FOR profiles
CREATE POLICY "Profiles are readable by owner, psychologist, and admin" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_psicologo(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Profiles are updatable by owner and admin" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin(auth.uid()));


-- RLS POLICIES FOR user_roles
CREATE POLICY "User roles are readable by owner, psychologist, and admin" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id OR public.is_psicologo(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "User roles are manageable by admin only" ON public.user_roles
    FOR ALL USING (public.is_admin(auth.uid()));


-- RLS POLICIES FOR questions
CREATE POLICY "Questions are readable by everyone (including anonymous)" ON public.questions
    FOR SELECT USING (active = true);

CREATE POLICY "Questions are manageable by admin only" ON public.questions
    FOR ALL USING (public.is_admin(auth.uid()));


-- RLS POLICIES FOR cat_parameters
CREATE POLICY "Cat parameters are readable by everyone (including anonymous)" ON public.cat_parameters
    FOR SELECT USING (true);

CREATE POLICY "Cat parameters are manageable by admin only" ON public.cat_parameters
    FOR ALL USING (public.is_admin(auth.uid()));


-- RLS POLICIES FOR tests
CREATE POLICY "Tests readable by owner, psychologist, and admin" ON public.tests
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL OR public.is_psicologo(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Tests insertable by everyone (allows anonymous tests)" ON public.tests
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Tests updatable by owner and admin" ON public.tests
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL OR public.is_admin(auth.uid()));


-- RLS POLICIES FOR answers
CREATE POLICY "Answers readable by owner, psychologist, and admin" ON public.answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tests t 
            WHERE t.id = test_id AND (t.user_id = auth.uid() OR t.user_id IS NULL)
        ) 
        OR public.is_psicologo(auth.uid()) 
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "Answers insertable by everyone" ON public.answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tests t 
            WHERE t.id = test_id AND (t.user_id = auth.uid() OR t.user_id IS NULL)
        )
    );


-- RLS POLICIES FOR predictions
CREATE POLICY "Predictions readable by owner, psychologist, and admin" ON public.predictions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tests t 
            WHERE t.id = test_id AND (t.user_id = auth.uid() OR t.user_id IS NULL)
        ) 
        OR public.is_psicologo(auth.uid()) 
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "Predictions insertable by everyone" ON public.predictions
    FOR INSERT WITH CHECK (true); -- Usually inserted by API route / system


-- RLS POLICIES FOR shap_explanations
CREATE POLICY "Shap explanations readable by owner, psychologist, and admin" ON public.shap_explanations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.predictions p
            JOIN public.tests t ON p.test_id = t.id
            WHERE p.id = prediction_id AND (t.user_id = auth.uid() OR t.user_id IS NULL)
        )
        OR public.is_psicologo(auth.uid())
        OR public.is_admin(auth.uid())
    );

CREATE POLICY "Shap explanations insertable by everyone" ON public.shap_explanations
    FOR INSERT WITH CHECK (true);


-- RLS POLICIES FOR citas
CREATE POLICY "Citas readable by owner, psychologist, and admin" ON public.citas
    FOR SELECT USING (auth.uid() = estudiante_id OR auth.uid() = psicologo_id OR public.is_psicologo(auth.uid()) OR public.is_admin(auth.uid()));

CREATE POLICY "Citas insertable by estudiante and admin" ON public.citas
    FOR INSERT WITH CHECK (auth.uid() = estudiante_id OR public.is_admin(auth.uid()));

CREATE POLICY "Citas updatable by psychologist and admin" ON public.citas
    FOR UPDATE USING (public.is_psicologo(auth.uid()) OR public.is_admin(auth.uid()));


-- RLS POLICIES FOR audit_log
CREATE POLICY "Audit logs manageable by admin only" ON public.audit_log
    FOR ALL USING (public.is_admin(auth.uid()));
