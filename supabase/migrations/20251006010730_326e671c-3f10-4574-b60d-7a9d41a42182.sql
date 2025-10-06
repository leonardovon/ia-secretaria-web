-- Drop existing policy
DROP POLICY IF EXISTS "Permitir todas operações em chats" ON clinica.chats;

-- Create new policy allowing all operations for both authenticated and anon users
CREATE POLICY "Permitir todas operações em chats" 
ON clinica.chats 
FOR ALL 
TO public, anon, authenticated
USING (true)
WITH CHECK (true);