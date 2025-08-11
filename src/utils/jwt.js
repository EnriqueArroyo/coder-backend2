import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || "1d";

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

export function cookieExtractor(req) {
  let token = null;
  if (req && req.cookies) token = req.cookies["jwt"] || null;
  return token;
}

export function bearerExtractor(req) {
  const auth = req.headers?.authorization;
  if (!auth) return null;
  const [scheme, token] = auth.split(" ");
  return scheme?.toLowerCase() === "bearer" ? token : null;
}
