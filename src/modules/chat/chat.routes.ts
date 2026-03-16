import { Router } from "express";
import chatController from "./chat.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import {
  validate,
  validateParams,
} from "../../middlewares/validate.middleware";
import {
  ProviderIdParamDTO,
  ChatIdParamDTO,
  SendMessageDTO,
} from "./chat.model";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all chats for authenticated user
router.get("/", chatController.getUserChats);

// Get or create chat for a provider
router.get(
  "/provider/:providerId",
  validateParams(ProviderIdParamDTO),
  chatController.getOrCreateChat
);

// Alias used by the frontend (postulacion ID = provider profile ID)
router.get(
  "/postulacion/:providerId",
  validateParams(ProviderIdParamDTO),
  chatController.getOrCreateChat
);

// Get messages from a chat
router.get(
  "/:chatId/messages",
  validateParams(ChatIdParamDTO),
  chatController.getMessages
);

// Send message (can also be done via Socket.IO)
router.post(
  "/:chatId/messages",
  validateParams(ChatIdParamDTO),
  validate(SendMessageDTO),
  chatController.sendMessage
);

export default router;
