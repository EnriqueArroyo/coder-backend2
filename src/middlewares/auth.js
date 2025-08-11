import passport from "../config/passport.js";

// Requiere un JWT válido (estrategia 'jwt')
export const requireAuth = passport.authenticate("jwt", { session: false });

// Políticas por rol: ['PUBLIC'] | ['AUTHENTICATED'] | ['admin'] | etc.
export const handlePolicies = (policies = []) => {
  return (req, res, next) => {
    if (policies.includes("PUBLIC")) return next();

    // Debe venir autenticado
    if (!req.user) {
      return res.status(401).send({ status: "error", message: "No Autorizado" });
    }

    if (policies.includes("AUTHENTICATED")) return next();

    // Roles específicos
    const role = req.user.role || "user";
    if (!policies.includes(role)) {
      return res.status(403).send({ status: "error", message: "Prohibido" });
    }

    next();
  };
};
