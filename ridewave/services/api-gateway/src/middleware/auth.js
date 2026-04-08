import jwt from "jsonwebtoken";

const publicPrefixes = ["/api/auth", "/health"];

export function verifyJwt(req, res, next) {
  if (publicPrefixes.some((prefix) => req.path.startsWith(prefix))) {
    return next();
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Missing bearer token" },
      timestamp: new Date().toISOString()
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      error: { code: "INVALID_TOKEN", message: "Token is invalid or expired" },
      timestamp: new Date().toISOString()
    });
  }
}
