CREATE OR REPLACE FUNCTION public.get_clinica_chats()
 RETURNS TABLE(phone text, nomewpp text, patient_name text, last_message text, last_message_time timestamp with time zone, unread_count integer)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
WITH latest AS (
  SELECT phone, MAX(created_at) AS max_created
  FROM clinica.chat_messages
  GROUP BY phone
),
src AS (
  SELECT DISTINCT ON (cm.phone)
    cm.phone,
    cm.nomewpp,
    cm.user_message,
    cm.bot_message,
    cm.created_at,
    regexp_replace(cm.phone, '[^0-9]', '', 'g') AS phone_digits,
    regexp_replace(coalesce(cm.nomewpp,''), '[^0-9]', '', 'g') AS nomewpp_digits
  FROM clinica.chat_messages cm
  JOIN latest l ON l.phone = cm.phone AND l.max_created = cm.created_at
  ORDER BY cm.phone, cm.created_at DESC
),
patient_data AS (
  SELECT DISTINCT ON (regexp_replace(telefone, '[^0-9]', '', 'g'))
    regexp_replace(telefone, '[^0-9]', '', 'g') AS telefone_digits,
    nomewpp
  FROM clinica.dados_cliente
  ORDER BY regexp_replace(telefone, '[^0-9]', '', 'g'), id DESC
)
SELECT
  s.phone,
  COALESCE(s.nomewpp, s.phone) AS nomewpp,
  CASE 
    WHEN pd.nomewpp IS NOT NULL THEN pd.nomewpp
    WHEN s.nomewpp IS NOT NULL AND s.nomewpp <> '' AND s.nomewpp_digits <> s.phone_digits THEN s.nomewpp
    ELSE NULL
  END AS patient_name,
  COALESCE(s.user_message, s.bot_message, '') AS last_message,
  s.created_at AS last_message_time,
  0::int AS unread_count
FROM src s
LEFT JOIN patient_data pd ON pd.telefone_digits = s.phone_digits
ORDER BY last_message_time DESC;
$function$;