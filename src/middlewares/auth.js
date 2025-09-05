import passport from "../config/passport.js";


export const requireAuth = passport.authenticate("jwt", { session: false });


export const handlePolicies = (policies = []) => {
  return (req, res, next) => {
    if (policies.includes("PUBLIC")) return next();


    if (!req.user) {
      return res.status(401).send({ status: "error", message: "No Autorizado" });
    }

    if (policies.includes("AUTHENTICATED")) return next();


    const role = req.user.role || "user";
    if (!policies.includes(role)) {
      return res.status(403).send({ status: "error", message: "Prohibido" });
    }

    next();
  };
};
