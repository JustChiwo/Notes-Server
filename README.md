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
   NODE_ENV=development
   ```

   `PORT`, `CLIENT_URL`, and `NODE_ENV` are optional for local development. If you leave them out, the server uses port 5000, allows `http://localhost:5173`, and runs in development mode.

   I only use the publishable key here. The secret (service role) key is never used, because it would bypass RLS and defeat the point of the project.

3. Start the development server:

   ```bash
   npm run dev
   ```

The server runs on port 5000 by default. Open `http://localhost:5000/` in your browser to check that it's working.

## Deploying to Render

Set `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `CLIENT_URL` in the Render service's environment variables. Set `CLIENT_URL` to the full origin of the deployed frontend, without a path. Set `NODE_ENV=production`; Render provides `PORT`.

In production, the `token` cookie is HTTP-only, secure, and uses `sameSite: 'none'` so it can be sent between the frontend and backend on different domains. Locally, it uses `secure: false` and `sameSite: 'lax'` to work over HTTP. The server trusts Render's proxy so secure cookies work correctly behind it.

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

### Log out

`POST /api/auth/logout`

Clears the `token` cookie and returns:

```json
{
  "message": "Logout successful."
}
```

Logging out removes the cookie from the browser. It does not cancel the access token on Supabase's side, so the token itself stays valid until it expires.

## Notes API

All notes endpoints require the `token` cookie from login. The frontend must send requests with credentials enabled. Notes are scoped to the signed-in user.

### List notes

`GET /api/notes`

Returns the user's notes, newest first.

### Create a note

`POST /api/notes`

Send a non-empty `title` and `content`:

```json
{
  "title": "A note",
  "content": "Note content"
}
```

The server trims both fields before saving. Missing or blank titles and content return `400`.

### Update a note

`PUT /api/notes/:id`

Send the fields to update. Both `title` and `content` are optional, but any provided value must be a non-empty string. The server trims provided values before saving. A note that cannot be found returns `404`.

### Delete a note

`DELETE /api/notes/:id`

Deletes the note and returns `{ "message": "Note deleted successfully." }`. A note that cannot be found returns `404`.

## Using the API from a frontend

CORS is set up to allow requests from `CLIENT_URL` (by default `http://localhost:5173`) and to allow cookies. Any trailing slash in `CLIENT_URL` is removed. Because the token lives in a cookie, the frontend has to include credentials in every request. For example:

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
controllers/  Request handlers for authentication and notes
routes/       API routes
app.js        Express app and server startup
```