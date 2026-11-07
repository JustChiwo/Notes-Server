// Use the base client for the public authentication endpoints.
const { supabase } = require('../config/supabase');

// Create a new account with Supabase Auth.
async function signup(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(201).json({ message: 'Signup successful.' });
  } catch (error) {
    console.error('Signup failed:', error);
    return res.status(500).json({ message: 'An unexpected error occurred.' });
  }
}

// Sign in and store the access token in an HTTP-only cookie.
async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(401).json({ message: error.message });
    }

    // Secure must be true when the app is deployed over HTTPS in production.
    res.cookie('token', data.session.access_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (error) {
    console.error('Login failed:', error);
    return res.status(500).json({ message: 'An unexpected error occurred.' });
  }
}

// Remove the sign-in cookie from the browser.
function logout(req, res) {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    });

    return res.status(200).json({ message: 'Logout successful.' });
  } catch (error) {
    console.error('Logout failed:', error);
    return res.status(500).json({ message: 'An unexpected error occurred.' });
  }
}

module.exports = { signup, login, logout };
