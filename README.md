# Private Notes Server

This is the backend for my Private Notes App. It's built with Node.js and Express, and it uses Supabase for user accounts and the database. The goal is simple: each user can only ever see their own notes.

To make that work, the server uses Supabase's publishable key and passes the signed-in user's access token along with database requests. That way Supabase's Row Level Security (RLS) policies know who is asking and apply the privacy rules.

## What you need

- Node.js and npm
- A Supabase project

## Getting started

1. Install the dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root and add:

   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   PORT=5000
   CLIENT_URL=http://localhost:5173
   ```

   `PORT` and `CLIENT_URL` are optional. If you leave them out, the server uses 5000 and `http://localhost:5173`.

   I only use the publishable key here. The secret (service role) key is never used, because it would bypass RLS and defeat the point of the project.

3. Start the development server:

   ```bash
   npm run dev
   ```

The server runs on port 5000 by default. Open `http://localhost:5000/` in your browser to check that it's working.

## Authentication API

All endpoints send and receive JSON. For POST requests, set the header `Content-Type: application/json`.

### Sign up

`POST /api/auth/signup`

```json
{
  "email": "you@example.com",
  "password": "your-password"
}
```

The password must be at least 6 characters. On success, the server returns `201`:

```json
{
  "message": "Signup successful."
}
```

Depending on the Supabase project's Auth settings, a user may need to confirm their email before they can log in.

### Log in

`POST /api/auth/login`

Send the same `email` and `password` fields. On success, the server returns `200` with the user's ID and email:

```json
{
  "user": {
    "id": "user-id",
    "email": "you@example.com"
  }
}
```

The access token is **not** in the response body. It's stored in an HTTP-only cookie called `token`, so JavaScript in the browser can't read it. The cookie lasts one hour.

A wrong password returns `401`, and a missing email or password returns `400`.

The cookie is set up for local development over HTTP (`secure: false`). When the app is deployed over HTTPS, `secure` needs to be `true`. If the frontend and backend end up on different domains, `sameSite` will need to change to `none` as well.

### Log out

`POST /api/auth/logout`

Clears the `token` cookie and returns:

```json
{
  "message": "Logout successful."
}
```

Logging out removes the cookie from the browser. It does not cancel the access token on Supabase's side, so the token itself stays valid until it expires.

## Using the API from a frontend

CORS is set up to allow requests from `CLIENT_URL` (by default `http://localhost:5173`) and to allow cookies. Because the token lives in a cookie, the frontend has to include credentials in every request. For example:

```js
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email, password }),
});
```

Any route that doesn't exist returns a `404` with `{ "message": "Route not found." }`.

## Project structure

```text
config/       Supabase client setup
controllers/  Request handlers for authentication
routes/       API routes
app.js        Express app and server startup
```