-- Update RPC functions to include patient name from dados_cliente
DROP FUNCTION IF EXISTS public.get_clinica_chats();
CREATE OR REPLACE FUNCTION public.get_clinica_chats()
RETURNS TABLE(
  phone text,
  nomewpp text,
  patient_name text,
  last_message text,
  last_message_time timestamptz,
  unread_count integer
) AS $$
  SELECT 
    cm.phone,
    COALESCE(cm.nomewpp, cm.phone) AS nomewpp,
    dc.nomewpp AS patient_name,
    COALESCE(cm.user_message, cm.bot_message, '') AS last_message,
    cm.created_at AS last_message_time,
    0::int AS unread_count
  FROM clinica.chat_messages cm
  LEFT JOIN clinica.dados_cliente dc ON cm.phone = dc.telefone
  JOIN (
    SELECT phone, MAX(created_at) AS max_created
    FROM clinica.chat_messages
    GROUP BY phone
  ) latest
    ON latest.phone = cm.phone AND latest.max_created = cm.created_at
  ORDER BY last_message_time DESC;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_clinica_chats() TO anon, authenticated;