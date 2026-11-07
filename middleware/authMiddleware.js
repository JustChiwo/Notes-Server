// Check the cookie token with Supabase before allowing a protected request.
const { supabase } = require('../config/supabase');

async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies && req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Not logged in.' });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    req.user = data.user;
    req.token = token;
    return next();
  } catch (error) {
    console.error('Authentication failed:', error);
    return res.status(500).json({ message: 'An unexpected error occurred.' });
  }
}

module.exports = authMiddleware;
