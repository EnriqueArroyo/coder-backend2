export const isSelfOrAdmin = () => {
  return (req, res, next) => {
    const requester = req.user; 
    const targetUserId = req.params.uid;

    if (!requester) {
      return res.status(401).send({ status: "error", message: "No Autorizado" });
    }

    const isAdmin = requester.role === "admin";
    const isSelf = requester._id?.toString?.() === targetUserId;

    if (isAdmin || isSelf) return next();

    return res.status(403).send({ status: "error", message: "Prohibido" });
  };
};

export const isCartOwner = () => {
  return (req, res, next) => {
    const userCart = req.user?.cart?.toString?.();
    const cid = req.params.cid;
    if (!userCart || userCart !== cid) {
      return res.status(403).send({ status: 'error', message: 'Forbidden (cart owner required)' });
    }
    next();
  };
};
