const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: 'No token provided' });

  const token = authHeader.split(' ')[1]; // Expect format: "Bearer TOKEN"
  if (!token) return res.status(401).json({ msg: 'Invalid token format' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // Attach user id for route handlers
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not valid' });
  }
}

module.exports = authMiddleware;
