-- Expor schema clinica na API REST do Supabase
-- Adicionar clinica aos schemas expostos pelo PostgREST

-- Nota: Esta configuração pode precisar ser aplicada no painel do Supabase
-- em Settings > API > Exposed schemas

-- Grant usage no schema clinica para anon e authenticated
GRANT USAGE ON SCHEMA clinica TO anon, authenticated;

-- Grant select, insert, update, delete nas tabelas do schema clinica
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA clinica TO anon, authenticated;

-- Garantir que futuras tabelas também tenham as permissões
ALTER DEFAULT PRIVILEGES IN SCHEMA clinica 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;