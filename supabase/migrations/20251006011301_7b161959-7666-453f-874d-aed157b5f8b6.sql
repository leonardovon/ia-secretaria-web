-- Create a view in public schema that references clinica.documents
CREATE OR REPLACE VIEW public.clinica_documents AS
SELECT 
  id,
  content,
  metadata,
  embedding
FROM clinica.documents;

-- Enable RLS on the view
ALTER VIEW public.clinica_documents SET (security_invoker = false);

-- Grant access to the view
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clinica_documents TO public, anon, authenticated;