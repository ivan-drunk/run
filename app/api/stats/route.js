import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data } = await supabase
    .from('stats')
    .select('*')
    .single()

  return Response.json(data)
}