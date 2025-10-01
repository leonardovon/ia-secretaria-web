-- Public RPCs to access clinica schema without exposing it via PostgREST
-- Get chat list (last message per phone)
CREATE OR REPLACE FUNCTION public.get_clinica_chats()
RETURNS TABLE(
  phone text,
  nomewpp text,
  last_message text,
  last_message_time timestamptz,
  unread_count integer
) AS $$
  SELECT 
    cm.phone,
    COALESCE(cm.nomewpp, cm.phone) AS nomewpp,
    COALESCE(cm.user_message, cm.bot_message, '') AS last_message,
    cm.created_at AS last_message_time,
    0::int AS unread_count
  FROM clinica.chat_messages cm
  JOIN (
    SELECT phone, MAX(created_at) AS max_created
    FROM clinica.chat_messages
    GROUP BY phone
  ) latest
    ON latest.phone = cm.phone AND latest.max_created = cm.created_at
  ORDER BY last_message_time DESC;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_clinica_chats() TO anon, authenticated;

-- Get all messages for a given phone
CREATE OR REPLACE FUNCTION public.get_clinica_messages(p_phone text)
RETURNS TABLE(
  id bigint,
  created_at timestamptz,
  active boolean,
  phone text,
  nomewpp text,
  bot_message text,
  user_message text,
  message_type text
) AS $$
  SELECT id, created_at, active, phone, nomewpp, bot_message, user_message, message_type
  FROM clinica.chat_messages
  WHERE phone = p_phone
  ORDER BY created_at ASC;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_clinica_messages(text) TO anon, authenticated;