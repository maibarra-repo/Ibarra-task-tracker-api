const jwt = require('jsonwebtoken');
 
const protect = (req, res, next) => {
  try {
  
    const authHeader = req.headers.authorization;
 
   if (!authHeader) {
      return res.status(401).json({
        message: 'Not authorized. No token provided.'
      });
    }
 

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Not authorized. Token format is invalid.'
      });
    }
 
    // Remove the word Bearer and keep only the token.
    const token = authHeader.split(' ')[1];
 
    // Verify the token using the JWT secret from .env.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
    // Store the decoded user information on the request object.
    // This lets protected routes access req.user.
    req.user = decoded;
 
    // Move to the next function or route.
    next();
  } catch (error) {
    res.status(401).json({
      message: 'Not authorized. Token failed.',
      error: error.message
    });
  }
};
 
module.exports = { protect };
 