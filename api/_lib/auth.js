import { createClient } from '@supabase/supabase-js';

export async function verifyAdmin(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return null;

  // STRICT EMAIL CHECK (Case-insensitive)
  const adminEmail = (process.env.VITE_ADMIN_EMAIL || 'homedressnaweb@gmail.com').toLowerCase();
  if (user.email.toLowerCase() !== adminEmail) {
    console.warn(`Unauthorized admin access attempt by ${user.email}`);
    return null;
  }

  return user;
}
