// Load the Supabase settings from the project's .env file.
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
const authOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
};

// This client is used for requests that do not need a signed-in user.
const supabase = createClient(supabaseUrl, supabasePublishableKey, authOptions);

// This client sends the user's token so Supabase can apply row-level security.
function getUserClient(token) {
  return createClient(supabaseUrl, supabasePublishableKey, {
    ...authOptions,
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

module.exports = { supabase, getUserClient };
