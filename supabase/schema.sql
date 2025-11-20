-- CRM Acadêmico - Schema Completo
-- Este arquivo contém todo o schema necessário para o sistema de acompanhamento acadêmico

-- ============================================
-- 1. EXTENSÕES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. TABELA DE PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('coordenador', 'professor')),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. TABELA DE TURMAS
-- ============================================
CREATE TABLE IF NOT EXISTS public.turmas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  coordenador_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  professor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  dias_aula TEXT[] NOT NULL DEFAULT '{}',
  horario TEXT NOT NULL,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. TABELA DE ALUNOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.alunos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  atividades_entregues INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. TABELA DE CHAMADAS
-- ============================================
CREATE TABLE IF NOT EXISTS public.chamadas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  professor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(turma_id, data)
);

-- ============================================
-- 6. TABELA DE CHAMADAS_ALUNOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.chamadas_alunos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chamada_id UUID NOT NULL REFERENCES public.chamadas(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  presente BOOLEAN NOT NULL DEFAULT false,
  observacao TEXT,
  UNIQUE(chamada_id, aluno_id)
);

-- ============================================
-- 7. TABELA DE ALUNO_CARDS
-- ============================================
CREATE TABLE IF NOT EXISTS public.aluno_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  column_id TEXT NOT NULL CHECK (column_id IN ('faltou_ultima', 'faltou_2_seguidas', 'faltou_3_mais_seguidas', 'faltas_intercaladas', 'contato_realizado')),
  total_faltas INTEGER DEFAULT 0,
  faltas_consecutivas INTEGER DEFAULT 0,
  ultima_falta DATE,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(aluno_id)
);

-- ============================================
-- 8. TABELA DE EMAIL_LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destinatario TEXT NOT NULL,
  assunto TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('manual', 'automatico')),
  template TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('enviado', 'erro', 'pendente')),
  prioridade TEXT NOT NULL DEFAULT 'normal' CHECK (prioridade IN ('alta', 'normal')),
  enviado_por UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enviado_em TIMESTAMPTZ DEFAULT NOW(),
  erro_mensagem TEXT
);

-- ============================================
-- 9. TABELA DE EMAIL_QUOTA
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_quota (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_count INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 100,
  last_reset DATE DEFAULT CURRENT_DATE,
  warning_threshold INTEGER DEFAULT 80
);

-- Inserir registro único de quota
INSERT INTO public.email_quota (id, daily_count, daily_limit, last_reset, warning_threshold)
VALUES (uuid_generate_v4(), 0, 100, CURRENT_DATE, 80)
ON CONFLICT DO NOTHING;

-- ============================================
-- 10. TABELA DE EMAIL_CONFIG
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_envio_ativo BOOLEAN DEFAULT false,
  horario_envio TEXT DEFAULT '18:00',
  emails_destinatarios TEXT[] DEFAULT '{}',
  UNIQUE(user_id)
);

-- ============================================
-- 11. ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_turmas_professor ON public.turmas(professor_id);
CREATE INDEX IF NOT EXISTS idx_turmas_coordenador ON public.turmas(coordenador_id);
CREATE INDEX IF NOT EXISTS idx_alunos_turma ON public.alunos(turma_id);
CREATE INDEX IF NOT EXISTS idx_chamadas_turma ON public.chamadas(turma_id);
CREATE INDEX IF NOT EXISTS idx_chamadas_data ON public.chamadas(data);
CREATE INDEX IF NOT EXISTS idx_chamadas_alunos_chamada ON public.chamadas_alunos(chamada_id);
CREATE INDEX IF NOT EXISTS idx_chamadas_alunos_aluno ON public.chamadas_alunos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_aluno_cards_aluno ON public.aluno_cards(aluno_id);
CREATE INDEX IF NOT EXISTS idx_aluno_cards_turma ON public.aluno_cards(turma_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_enviado_por ON public.email_logs(enviado_por);

-- ============================================
-- 12. TRIGGERS PARA UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_turmas_updated_at BEFORE UPDATE ON public.turmas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alunos_updated_at BEFORE UPDATE ON public.alunos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aluno_cards_updated_at BEFORE UPDATE ON public.aluno_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 13. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chamadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chamadas_alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aluno_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_quota ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_config ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES - PROFILES
-- ============================================
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- POLICIES - TURMAS
-- ============================================
CREATE POLICY "Professores veem apenas suas turmas"
  ON public.turmas FOR SELECT
  USING (
    professor_id = auth.uid() OR
    coordenador_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coordenador'
    )
  );

CREATE POLICY "Apenas coordenadores podem criar turmas"
  ON public.turmas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coordenador'
    )
  );

CREATE POLICY "Apenas coordenadores podem atualizar turmas"
  ON public.turmas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coordenador'
    )
  );

CREATE POLICY "Apenas coordenadores podem deletar turmas"
  ON public.turmas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coordenador'
    )
  );

-- ============================================
-- POLICIES - ALUNOS
-- ============================================
CREATE POLICY "Ver alunos das turmas permitidas"
  ON public.alunos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.turmas
      WHERE turmas.id = alunos.turma_id
      AND (
        turmas.professor_id = auth.uid() OR
        turmas.coordenador_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'coordenador'
        )
      )
    )
  );

CREATE POLICY "Professores e coordenadores podem adicionar alunos"
  ON public.alunos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.turmas
      WHERE turmas.id = alunos.turma_id
      AND (
        turmas.professor_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'coordenador'
        )
      )
    )
  );

CREATE POLICY "Professores e coordenadores podem atualizar alunos"
  ON public.alunos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.turmas
      WHERE turmas.id = alunos.turma_id
      AND (
        turmas.professor_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'coordenador'
        )
      )
    )
  );

CREATE POLICY "Professores e coordenadores podem deletar alunos"
  ON public.alunos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.turmas
      WHERE turmas.id = alunos.turma_id
      AND (
        turmas.professor_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'coordenador'
        )
      )
    )
  );

-- ============================================
-- POLICIES - CHAMADAS
-- ============================================
CREATE POLICY "Ver chamadas das turmas permitidas"
  ON public.chamadas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.turmas
      WHERE turmas.id = chamadas.turma_id
      AND (
        turmas.professor_id = auth.uid() OR
        turmas.coordenador_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'coordenador'
        )
      )
    )
  );

CREATE POLICY "Professores podem criar chamadas"
  ON public.chamadas FOR INSERT
  WITH CHECK (
    professor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.turmas
      WHERE turmas.id = chamadas.turma_id
      AND turmas.professor_id = auth.uid()
    )
  );

CREATE POLICY "Professores podem atualizar suas chamadas"
  ON public.chamadas FOR UPDATE
  USING (professor_id = auth.uid());

-- ============================================
-- POLICIES - CHAMADAS_ALUNOS
-- ============================================
CREATE POLICY "Ver chamadas_alunos das turmas permitidas"
  ON public.chamadas_alunos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chamadas
      JOIN public.turmas ON turmas.id = chamadas.turma_id
      WHERE chamadas.id = chamadas_alunos.chamada_id
      AND (
        turmas.professor_id = auth.uid() OR
        turmas.coordenador_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'coordenador'
        )
      )
    )
  );

CREATE POLICY "Professores podem registrar presença"
  ON public.chamadas_alunos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.chamadas
      WHERE chamadas.id = chamadas_alunos.chamada_id
      AND chamadas.professor_id = auth.uid()
    )
  );

-- ============================================
-- POLICIES - ALUNO_CARDS
-- ============================================
CREATE POLICY "Ver cards das turmas permitidas"
  ON public.aluno_cards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.turmas
      WHERE turmas.id = aluno_cards.turma_id
      AND (
        turmas.professor_id = auth.uid() OR
        turmas.coordenador_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'coordenador'
        )
      )
    )
  );

CREATE POLICY "Professores e coordenadores podem gerenciar cards"
  ON public.aluno_cards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.turmas
      WHERE turmas.id = aluno_cards.turma_id
      AND (
        turmas.professor_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'coordenador'
        )
      )
    )
  );

-- ============================================
-- POLICIES - EMAIL_LOGS
-- ============================================
CREATE POLICY "Ver próprios logs ou todos se coordenador"
  ON public.email_logs FOR SELECT
  USING (
    enviado_por = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'coordenador'
    )
  );

CREATE POLICY "Criar logs de email"
  ON public.email_logs FOR INSERT
  WITH CHECK (enviado_por = auth.uid());

-- ============================================
-- POLICIES - EMAIL_QUOTA
-- ============================================
CREATE POLICY "Todos podem ver quota"
  ON public.email_quota FOR SELECT
  USING (true);

CREATE POLICY "Apenas sistema pode atualizar quota"
  ON public.email_quota FOR UPDATE
  USING (true);

-- ============================================
-- POLICIES - EMAIL_CONFIG
-- ============================================
CREATE POLICY "Ver própria configuração"
  ON public.email_config FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Gerenciar própria configuração"
  ON public.email_config FOR ALL
  USING (user_id = auth.uid());

-- ============================================
-- 14. FUNCTIONS ÚTEIS
-- ============================================

-- Função para criar profile automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, name)
  VALUES (NEW.id, 'professor', COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuário'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar profile automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para resetar quota diária
CREATE OR REPLACE FUNCTION public.reset_email_quota_if_needed()
RETURNS void AS $$
BEGIN
  UPDATE public.email_quota
  SET daily_count = 0, last_reset = CURRENT_DATE
  WHERE last_reset < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter histórico de faltas de um aluno
CREATE OR REPLACE FUNCTION public.get_aluno_faltas_historico(
  p_aluno_id UUID,
  p_dias_limite INTEGER DEFAULT 30
)
RETURNS TABLE (
  data DATE,
  presente BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.data, ca.presente
  FROM public.chamadas_alunos ca
  JOIN public.chamadas c ON c.id = ca.chamada_id
  WHERE ca.aluno_id = p_aluno_id
    AND c.data >= CURRENT_DATE - p_dias_limite
  ORDER BY c.data DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 15. DROPAR TABELAS ANTIGAS (SE EXISTIREM)
-- ============================================
DROP TABLE IF EXISTS public.deals CASCADE;
DROP TABLE IF EXISTS public.columns CASCADE;

