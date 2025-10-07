-- Conceder permissões faltantes e recarregar cache do PostgREST para o schema clinica

-- Garantir USAGE para service_role
GRANT USAGE ON SCHEMA clinica TO service_role;

-- Garantir privilégios em TABELAS (já feito para anon/authenticated; reforçar para service_role)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA clinica TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA clinica 
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;

-- Garantir privilégios em SEQUENCES (necessário para inserts com bigserial/serial)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA clinica TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA clinica 
GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

-- Recarregar cache do PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';