import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  LoginDTO,
  RegisterDTO,
  ChangePasswordDTO,
  RefreshTokenDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
} from "./auth.model";

const router = Router();
const authController = new AuthController();

// Rutas públicas
router.post("/register", validate(RegisterDTO), authController.register);
router.post("/login", validate(LoginDTO), authController.login);
router.post(
  "/refresh-token",
  validate(RefreshTokenDTO),
  authController.refreshToken,
);
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);
router.post("/forgot-password", validate(ForgotPasswordDTO), authController.forgotPassword);
router.post("/reset-password", validate(ResetPasswordDTO), authController.resetPassword);

// Rutas protegidas
router.get("/me", authMiddleware, authController.me);
router.post(
  "/change-password",
  authMiddleware,
  validate(ChangePasswordDTO),
  authController.changePassword,
);

export default router;
