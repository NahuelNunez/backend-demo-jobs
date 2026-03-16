import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  MaxLength,
  Matches,
  ValidateIf,
  IsUUID,
} from "class-validator";

/**
 * DTO para validar el ID de proveedor en los parámetros de ruta
 */
export class ProviderIdParamDTO {
  @IsNotEmpty({ message: "Provider ID is required" })
  @IsUUID(4, { message: "Provider ID must be a valid UUID" })
  providerId: string;
}

/**
 * DTO para validar el ID de chat en los parámetros de ruta
 */
export class ChatIdParamDTO {
  @IsNotEmpty({ message: "Chat ID is required" })
  @IsUUID(4, { message: "Chat ID must be a valid UUID" })
  chatId: string;
}

/**
 * DTO para enviar un mensaje
 * Valida que al menos texto o urlAdjunto esté presente (validación en servicio)
 */
export class SendMessageDTO {
  @IsOptional()
  @IsString({ message: "Text must be a string" })
  @MaxLength(5000, {
    message: "Text cannot exceed 5000 characters",
  })
  text?: string;

  @IsOptional()
  @IsString({ message: "Attachment URL must be a string" })
  @IsUrl(
    {
      protocols: ["http", "https"],
      require_protocol: true,
    },
    { message: "Attachment URL must be a valid URL (http or https)" }
  )
  @MaxLength(2048, {
    message: "Attachment URL cannot exceed 2048 characters",
  })
  attachmentUrl?: string;

  @ValidateIf((o) => !!o.attachmentUrl)
  @IsNotEmpty({
    message: "Attachment type is required when there is an attachment",
  })
  @IsString({ message: "Attachment type must be a string" })
  @Matches(
    /^(image|video|audio|application|text)\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/,
    {
      message:
        "Attachment type must be a valid MIME type (e.g., image/jpeg, video/mp4)",
    }
  )
  @MaxLength(100, {
    message: "Attachment type cannot exceed 100 characters",
  })
  attachmentType?: string;
}

/**
 * DTO para query parameters de paginación (opcional, para futuras mejoras)
 */
export class PaginacionQueryDTO {
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: "Page must be a positive integer" })
  page?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, {
    message: "Limit must be a positive integer",
  })
  limit?: string;
}

/**
 * Response interfaces matching Prisma output field names
 */
export interface MessageResponse {
  id: string;
  chatId: string;
  senderId: string;
  text: string | null;
  attachmentUrl: string | null;
  attachmentType: string | null;
  createdAt: Date;
  sender: {
    id: string;
    email: string;
    role: string;
  };
}

export interface ChatResponse {
  id: string;
  providerId: string;
  createdAt: Date;
  provider: {
    id: string;
    title: string | null;
    fullName: string;
  };
  messages: MessageResponse[];
}
