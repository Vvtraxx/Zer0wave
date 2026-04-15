import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://aaoifhkjbatxhovsdffp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhb2lmaGtqYmF0eGhvdnNkZmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMjgyNzUsImV4cCI6MjA5MTYwNDI3NX0.LYfxiEFof_J1NrP0-jLZW-0e4zle0Y9Iff7JZIhvl-k";

export const supabase = createClient(supabaseUrl, supabaseKey);