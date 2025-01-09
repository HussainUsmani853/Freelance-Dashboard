import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mljrtisqdwdezoaougsd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sanJ0aXNxZHdkZXpvYW91Z3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0MDk4NzcsImV4cCI6MjA1MTk4NTg3N30.E0h-SonLypEwhyVfSboXkuUfwNP7ceZX0Ro36pzIt08";

export const supabase = createClient(supabaseUrl, supabaseKey);