import { Router } from "express";
import userModel from "../models/userModel.js";
import { generateToken } from "../utils/jwt.js";
import passport from "../config/passport.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, age, password } = req.body;

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

    // El pre('save') del modelo hashea la contraseña
    const user = await userModel.create({
      first_name,
      last_name,
      email,
      age,
      password,
    });

    res.status(201).send({
      status: "success",
      message: "User registered",
      payload: { id: user._id, email: user.email },
    });
  } catch (err) {
    res.status(500).send({ status: "error", message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user)
      return res
        .status(401)
        .send({ status: "error", message: "Invalid credentials" });

    const ok = user.isValidPassword(password);
    if (!ok)
      return res
        .status(401)
        .send({ status: "error", message: "Invalid credentials" });

    const token = generateToken({
      uid: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res
      .cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24,
      })
      .send({
        status: "success",
        message: "Logged in",
        token,
      });
  } catch (err) {
    res.status(500).send({ status: "error", message: err.message });
  }
});

router.get("/current", requireAuth, async (req, res) => {
  const {
    _id,
    first_name,
    last_name,
    email,
    age,
    role,
    cart,
    createdAt,
    updatedAt,
  } = req.user;
  res.send({
    status: "success",
    payload: {
      _id,
      first_name,
      last_name,
      email,
      age,
      role,
      cart,
      createdAt,
      updatedAt,
    },
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("jwt").send({ status: "success", message: "Logged out" });
});

export default router;
