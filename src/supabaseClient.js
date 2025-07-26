import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ydyvamdzaqtgjuozlxow.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkeXZhbWR6YXF0Z2p1b3pseG93Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA2MTk0OSwiZXhwIjoyMDY4NjM3OTQ5fQ.9U1mUOJWvFXTpbJ8fjHJVYy9Fkt_eNjV-S7xEIkmWlY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 