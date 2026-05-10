import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://llnpprgdbcnynkpjhrfx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbnBwcmdkYmNueW5rcGpocmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMjc2MzYsImV4cCI6MjA5MzYwMzYzNn0.vfb_8EwM_mzOLHD5EhA7V6t7J_yy4y2BxepxX1sTG7A'
)
