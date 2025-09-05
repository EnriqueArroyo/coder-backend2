// src/routes/sessionsRouter.js
import { Router } from "express";
import passport from "../config/passport.js";
import { generateToken } from "../utils/jwt.js";
import { requireAuth } from "../middlewares/auth.js";
import { toUserDTO } from "../dtos/user.dto.js";

import crypto from "crypto";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import { sendPasswordResetMail } from "../utils/mailer.js";

const router = Router();


router.post("/register", (req, res, next) => {
  passport.authenticate("register", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res
        .status(400)
        .send({ status: "error", message: info?.message || "Register failed" });
    res
      .status(201)
      .send({
        status: "success",
        message: "User registered",
        payload: { id: user._id, email: user.email },
      });
  })(req, res, next);
});


router.post("/login", (req, res, next) => {
  passport.authenticate("login", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res
        .status(401)
        .send({
          status: "error",
          message: info?.message || "Invalid credentials",
        });

    const token = generateToken({
      uid: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return res
      .cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 1000 * 60 * 60 * 24,
      })
      .send({ status: "success", message: "Logged in", token });
  })(req, res, next);
});

/** CURRENT (DTO sin datos sensibles) */
router.get("/current", requireAuth, (req, res) => {
  res.send({ status: "success", payload: toUserDTO(req.user) });
});

/** LOGOUT */
router.post("/logout", (req, res) => {
  res.clearCookie("jwt").send({ status: "success", message: "Logged out" });
});


router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email)
      return res
        .status(400)
        .send({ status: "error", message: "Email is required" });

    const user = await userModel.findOne({ email });
    // Respuesta genérica para no revelar si existe
    if (!user)
      return res.send({
        status: "success",
        message: "If the email exists, a reset link was sent.",
      });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save();

    const base = process.env.BASE_URL || "http://localhost:3000";
    const link = `${base}/api/sessions/reset-password?token=${rawToken}&email=${encodeURIComponent(
      email
    )}`;

    await sendPasswordResetMail(email, link);
    if (process.env.NODE_ENV !== "production")
      console.log("[DEV] Reset link:", link);

    res.send({
      status: "success",
      message: "If the email exists, a reset link was sent.",
    });
  } catch (err) {
    res.status(500).send({ status: "error", message: err.message });
  }
});


router.post("/reset-password", async (req, res) => {
  try {
    const { token, email, newPassword } = req.body || {};
    if (!token || !email || !newPassword) {
      return res
        .status(400)
        .send({ status: "error", message: "Missing fields" });
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await userModel.findOne({
      email,
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user)
      return res
        .status(400)
        .send({ status: "error", message: "Invalid or expired token" });

  
    const same = bcrypt.compareSync(newPassword, user.password);
    if (same)
      return res
        .status(400)
        .send({ status: "error", message: "New password must be different" });

    user.password = newPassword; // pre('save') hashea
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.send({ status: "success", message: "Password updated" });
  } catch (err) {
    res.status(500).send({ status: "error", message: err.message });
  }
});

router.get('/reset-password', (req, res) => {
  const { token, email } = req.query || {};
  if (!token || !email) {
    return res.status(400).type('html').send('<h3>Link inválido</h3>');
  }
  res.type('html').send(`<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Restablecer contraseña</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; padding: 24px; max-width: 520px; margin: auto; }
      form { display: grid; gap: 12px; }
      input { padding: 10px; font-size: 16px; }
      button { padding: 10px 14px; font-size: 16px; cursor: pointer; }
      .msg { margin-top: 10px; }
    </style>
  </head>
  <body>
    <h2>Restablecer contraseña</h2>
    <p>Para: <b>${email.replace(/</g,'&lt;')}</b></p>
    <form id="form">
      <input type="password" id="newPassword" placeholder="Nueva contraseña" required minlength="6" />
      <input type="password" id="confirmPassword" placeholder="Confirmar contraseña" required minlength="6" />
      <button type="submit">Guardar nueva contraseña</button>
      <div id="msg" class="msg"></div>
    </form>
    <script>
      const form = document.getElementById('form');
      const msg  = document.getElementById('msg');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value.trim();
        const confirm = document.getElementById('confirmPassword').value.trim();
        if (newPassword !== confirm) { msg.textContent = 'Las contraseñas no coinciden.'; msg.style.color = 'crimson'; return; }
        msg.textContent = 'Enviando...'; msg.style.color = '#333';
        try {
          const r = await fetch('/api/sessions/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: '${token}', email: '${email}', newPassword })
          });
          const data = await r.json().catch(() => ({}));
          if (r.ok) { msg.textContent = data.message || 'Contraseña actualizada ✅'; msg.style.color = 'green'; }
          else { msg.textContent = data.message || 'Error al actualizar la contraseña'; msg.style.color = 'crimson'; }
        } catch (err) {
          msg.textContent = 'Error de red'; msg.style.color = 'crimson';
        }
      });
    </script>
  </body>
</html>`);
});

export default router;
