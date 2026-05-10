import { supabase } from '@/lib/supabase'

export async function POST() {
  const { data } = await supabase
    .from('stats')
    .select('total_clicks')
    .single()

  await supabase
    .from('stats')
    .update({ total_clicks: data.total_clicks + 1 })
    .eq('id', 1)

  return Response.json({ success: true })
}