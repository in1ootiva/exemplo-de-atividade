-- ============================================
-- MIGRATION: Adicionar campo atividades_entregues
-- Data: 2025-11-20
-- Descrição: Adiciona campo para contar atividades entregues do GoDevs
-- ============================================

-- Adicionar coluna se não existir
ALTER TABLE public.alunos 
ADD COLUMN IF NOT EXISTS atividades_entregues INTEGER DEFAULT 0 NOT NULL;

-- Comentário da coluna
COMMENT ON COLUMN public.alunos.atividades_entregues IS 'Número de atividades entregues pelo aluno (sincronizado do GoDevs)';

