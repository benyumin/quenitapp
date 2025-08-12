import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ydyvamdzaqtgjuozlxow.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkeXZhbWR6YXF0Z2p1b3pseG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNjE5NDksImV4cCI6MjA2ODYzNzk0OX0.EWMerWMbvCLGCf6cQDfha0wjNIa5MowfxXL2gfzW3dM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

