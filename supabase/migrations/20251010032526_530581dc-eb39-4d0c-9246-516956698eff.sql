-- Atualizar função get_clinica_chats para fazer o JOIN corretamente
-- Removendo sufixo do WhatsApp antes de comparar os telefones
CREATE OR REPLACE FUNCTION public.get_clinica_chats()
 RETURNS TABLE(phone text, nomewpp text, patient_name text, last_message text, last_message_time timestamp with time zone, unread_count integer)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    cm.phone,
    COALESCE(cm.nomewpp, cm.phone) AS nomewpp,
    dc.nomewpp AS patient_name,
    COALESCE(cm.user_message, cm.bot_message, '') AS last_message,
    cm.created_at AS last_message_time,
    0::int AS unread_count
  FROM clinica.chat_messages cm
  LEFT JOIN clinica.dados_cliente dc ON REPLACE(REPLACE(cm.phone, '@s.whatsapp.net', ''), '@c.us', '') = dc.telefone
  JOIN (
    SELECT phone, MAX(created_at) AS max_created
    FROM clinica.chat_messages
    GROUP BY phone
  ) latest
    ON latest.phone = cm.phone AND latest.max_created = cm.created_at
  ORDER BY last_message_time DESC;
$function$;