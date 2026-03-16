import { Role } from "@prisma/client";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  Matches,
} from "class-validator";

export class RegisterDTO {
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Must be a valid email" })
  email: string;

  @IsNotEmpty({ message: "Password is required" })
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  })
  password: string;

  @IsNotEmpty({ message: "Role is required" })
  @IsEnum(Role, { message: "Invalid role" })
  role: Role;
}

export class LoginDTO {
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Must be a valid email" })
  email: string;

  @IsNotEmpty({ message: "Password is required" })
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password: string;
}

export class ChangePasswordDTO {
  @IsNotEmpty({ message: "Current password is required" })
  @IsString()
  currentPassword: string;

  @IsNotEmpty({ message: "New password is required" })
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  })
  newPassword: string;
}

export class RefreshTokenDTO {
  @IsNotEmpty({ message: "Refresh token is required" })
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDTO {
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Must be a valid email" })
  email: string;
}

export class ResetPasswordDTO {
  @IsNotEmpty({ message: "Token is required" })
  @IsString()
  token: string;

  @IsNotEmpty({ message: "New password is required" })
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  })
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      role: string;
    };
    token: string;
  };
  error?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}
