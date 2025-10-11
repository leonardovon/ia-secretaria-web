import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

export function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function validateClinicExists(supabase: any, clinicId: string): Promise<boolean> {
  const { data, error } = await supabase
    .schema('clinica')
    .from('config')
    .select('id')
    .eq('id', clinicId)
    .single();
  
  if (error || !data) {
    return false;
  }
  
  return true;
}
