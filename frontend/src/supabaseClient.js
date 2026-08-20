import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vgekbknitxsrfrgvzbxo.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnZWtia25pdHhzcmZyZ3Z6YnhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxMTU1MDgsImV4cCI6MjEwMjY5MTUwOH0.iP_y0cwWclOhf9mupfeHytkMRi1QRZz_rEciOn1gzBw'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)