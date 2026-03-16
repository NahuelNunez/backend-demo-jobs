import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";
import { CustomError } from "../../utils/customError";
import { RegisterDTO, JWTPayload } from "./auth.model";
import { env } from "../../config/env";
import {
  sendVerificationEmail,
  verifyEmailToken,
  sendPasswordResetEmail,
} from "../../services/verifyEmail";

export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;
  private readonly SALT_ROUNDS = 10;

  constructor() {
    if (!env.JWT_SECRET) {
      throw new Error("JWT_SECRET no está configurado");
    }
    if (!env.JWT_EXPIRES_IN) {
      throw new Error("JWT_EXPIRES_IN no está configurado");
    }
    this.JWT_SECRET = env.JWT_SECRET;
    this.JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;
  }

  async register(data: RegisterDTO) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) throw new CustomError("Email already registered", 409);

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    // Create user and profile in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: data.role,
        },
      });

      // Create profile according to role
      if (data.role === "CONTRACTOR") {
        await tx.contractorProfile.create({
          data: {
            userId: user.id,
          },
        });
      } else if (data.role === "PROVIDER") {
        await tx.providerProfile.create({
          data: {
            userId: user.id,
            fullName: "",
            profileComplete: false,
          },
        });
      }

      return user;
    });

    // Send verification email
    try {
      await sendVerificationEmail(newUser.id, newUser.email);
    } catch (error) {
      // Log error but don't fail registration
      console.error("Failed to send verification email:", error);
    }

    // Generate token
    const token = this.generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const refreshToken = this.generateRefreshToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      token,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new CustomError("Invalid credentials", 401);

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new CustomError("Invalid credentials", 401);
    }

    // Generate token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = this.generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
      refreshToken,
    };
  }

  generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new CustomError("Invalid or expired token", 401);
    }
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new CustomError("User not found", 404);

    return user;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new CustomError("User not found", 404);

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new CustomError("Current password is incorrect", 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: "Password updated successfully" };
  }

  generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: "7d", // Refresh token válido por 7 días
    } as jwt.SignOptions);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, this.JWT_SECRET) as JWTPayload;

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) throw new CustomError("User not found", 404);

      // Generate new tokens
      const newAccessToken = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const newRefreshToken = this.generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new CustomError("Invalid or expired refresh token", 401);
    }
  }

  async verifyEmail(token: string) {
    // Verify token
    const payload = await verifyEmailToken(token);

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) throw new CustomError("User not found", 404);

    if (user.isVerified) {
      throw new CustomError("Email already verified", 400);
    }

    // Update user verification status
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    return { message: "Email verified successfully" };
  }

  async resendVerificationEmail(email: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new CustomError("User not found", 404);

    if (user.isVerified) {
      throw new CustomError("Email already verified", 400);
    }

    // Send verification email
    await sendVerificationEmail(user.id, user.email);

    return { message: "Verification email sent successfully" };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Siempre respondemos igual para no filtrar si el email existe
    if (!user) return { message: "If that email exists, a reset link has been sent" };

    await sendPasswordResetEmail(user.id, user.email);

    return { message: "If that email exists, a reset link has been sent" };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: { userId: string; email: string };

    try {
      payload = jwt.verify(token, this.JWT_SECRET) as { userId: string; email: string };
    } catch {
      throw new CustomError("Invalid or expired reset token", 400);
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new CustomError("User not found", 404);

    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { message: "Password reset successfully" };
  }
}
