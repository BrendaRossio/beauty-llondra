// ⚠️ Reemplaza con tus credenciales reales de Supabase
const SUPABASE_URL = 'https://afupctlwhxrbhlzddnaf.supabase.co';
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmdXBjdGx3aHhyYmhsemRkbmFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MDg2MjcsImV4cCI6MjEwMjE4NDYyN30.SxzKwyA8brnnSO13_qQiC672N4A1UvAcQltf_Ata97M";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);