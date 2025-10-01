-- Tabela de documentos no schema clinica
CREATE TABLE clinica.documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  metadata JSONB,
  embedding vector
);

-- Habilitar RLS
ALTER TABLE clinica.documents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Permitir leitura em documents" ON clinica.documents FOR SELECT USING (true);
CREATE POLICY "Permitir inserção em documents" ON clinica.documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização em documents" ON clinica.documents FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão em documents" ON clinica.documents FOR DELETE USING (true);