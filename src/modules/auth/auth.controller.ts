import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import {
  RegisterDTO,
  LoginDTO,
  ChangePasswordDTO,
  RefreshTokenDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
} from "./auth.model";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data: RegisterDTO = req.body;
      const result = await this.authService.register(data);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email, password }: LoginDTO = req.body;
      const result = await this.authService.login(email, password);

      res.status(200).json({
        success: true,
        message: "Login exitoso",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const user = await this.authService.getUserById(userId);

      res.status(200).json({
        success: true,
        message: "Usuario obtenido exitosamente",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword }: ChangePasswordDTO = req.body;

      const result = await this.authService.changePassword(
        userId,
        currentPassword,
        newPassword,
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { refreshToken }: RefreshTokenDTO = req.body;
      const result = await this.authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: "Tokens renovados exitosamente",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { token } = req.body;
      const result = await this.authService.verifyEmail(token);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  resendVerification = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email } = req.body;
      const result = await this.authService.resendVerificationEmail(email);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email }: ForgotPasswordDTO = req.body;
      const result = await this.authService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { token, newPassword }: ResetPasswordDTO = req.body;
      const result = await this.authService.resetPassword(token, newPassword);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
}
