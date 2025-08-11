import { Router } from "express";
import userModel from "../models/userModel.js";
import { requireAuth, handlePolicies } from "../middlewares/auth.js";
import { isSelfOrAdmin } from "../middlewares/ownership.js";

const router = Router();


router.get("/", requireAuth, handlePolicies(["admin"]), async (req, res) => {
  try {
    const result = await userModel.find().lean();
    res.send({ status: "success", payload: result });
  } catch (error) {
    res.status(500).send({ status: "error", message: error.message });
  }
});


router.get("/:uid", requireAuth, isSelfOrAdmin(), async (req, res) => {
  try {
    const user = await userModel.findById(req.params.uid).lean();
    if (!user)
      return res
        .status(404)
        .send({ status: "error", message: "User not found" });
    res.send({ status: "success", payload: user });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});


router.post("/", requireAuth, handlePolicies(["admin"]), async (req, res) => {
  try {
    const { first_name, last_name, email, age, password, role, cart } =
      req.body;
    if (!first_name || !last_name || !email || !age || !password) {
      return res
        .status(400)
        .send({ status: "error", message: "Missing fields" });
    }
    const exists = await userModel.findOne({ email });
    if (exists)
      return res
        .status(409)
        .send({ status: "error", message: "Email already in use" });

    const created = await userModel.create({
      first_name,
      last_name,
      email,
      age,
      password,
      role,
      cart,
    });
    res
      .status(201)
      .send({
        status: "success",
        payload: { _id: created._id, email: created.email },
      });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});


router.put("/:uid", requireAuth, isSelfOrAdmin(), async (req, res) => {
  try {
    const user = await userModel.findById(req.params.uid);
    if (!user)
      return res
        .status(404)
        .send({ status: "error", message: "User not found" });

    const fields = [
      "first_name",
      "last_name",
      "email",
      "age",
      "password",
      "role",
      "cart",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) user[f] = req.body[f];
    });

    await user.save(); // dispara el pre('save') y hashea si cambió password
    res.send({ status: "success", payload: { _id: user._id } });
  } catch (error) {
    res.status(400).send({ status: "error", message: error.message });
  }
});


router.delete(
  "/:uid",
  requireAuth,
  handlePolicies(["admin"]),
  async (req, res) => {
    try {
      const result = await userModel.deleteOne({ _id: req.params.uid });
      res.send({ status: "success", payload: result });
    } catch (error) {
      res.status(400).send({ status: "error", message: error.message });
    }
  }
);


router.patch(
  "/:uid/role",
  requireAuth,
  handlePolicies(["admin"]),
  async (req, res) => {
    try {
      const { role } = req.body;
      const allowed = ["user", "user_premium", "admin"];
      if (!allowed.includes(role)) {
        return res
          .status(400)
          .send({ status: "error", message: "Invalid role" });
      }
      const updated = await userModel.findByIdAndUpdate(
        req.params.uid,
        { role },
        { new: true }
      );
      if (!updated)
        return res
          .status(404)
          .send({ status: "error", message: "User not found" });
      res.send({
        status: "success",
        payload: { _id: updated._id, role: updated.role },
      });
    } catch (error) {
      res.status(400).send({ status: "error", message: error.message });
    }
  }
);

export default router;
