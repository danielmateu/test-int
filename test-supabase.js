const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: 'next_auth' } }
);

async function test() {
  console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("KEY length:", process.env.SUPABASE_SERVICE_ROLE_KEY?.length);
  
  const { data, error } = await supabase.from('users').select('*').limit(1);
  
  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Success! Data:", data);
  }
}

test();
