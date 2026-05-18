import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: 'next_auth' } }
);

async function test() {
  console.log("Testing connection to Supabase...");
  console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  
  const { data, error } = await supabase.from('users').insert({
    name: 'Test User',
    email: 'test@example.com',
  }).select();
  
  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Success! Inserted data:", data);
    // clean up
    await supabase.from('users').delete().eq('email', 'test@example.com');
  }
}

test();
