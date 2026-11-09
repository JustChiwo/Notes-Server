# Private Notes Server

This is the backend for my Private Notes App. It's built with Node.js and Express, and it uses Supabase for user accounts and the database. The goal is simple: each user can only ever see their own notes.

To make that work, the server uses Supabase's publishable key and passes the signed-in user's access token along with database requests. That way Supabase's Row Level Security (RLS) policies know who is asking and apply the privacy rules.

## Live links

- **Live app:** https://privatenotesapp.vercel.app/
- **Live API:** https://notes-server-yxtr.onrender.com/
- **Frontend repo:** [add your client repo link here]

The API runs on Render's free plan, so it goes to sleep when nobody is using it. The first request after a quiet period can take up to a minute while it wakes up. After that it responds normally.

## How it works

1. **Sign up and log in.** The server passes the email and password to Supabase Auth, which handles the accounts.
2. **Token in a cookie.** After login, the access token (a JWT) is stored in an HTTP-only cookie, so JavaScript in the browser can't read it.
3. **Middleware check.** Every notes route (and logout) goes through an authentication middleware. It reads the cookie and asks Supabase to confirm the token is valid. If it isn't, the request gets a `401`.
4. **Row Level Security.** For notes, the server creates a Supabase client that carries the user's token. The database then uses the `notes` table policies, which only allow a user to read, add, edit or delete rows where `user_id` matches their own ID.