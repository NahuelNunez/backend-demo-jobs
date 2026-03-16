import prisma from "../../config/prisma";
import { CustomError } from "../../utils/customError";

class ChatService {
  // Create or get chat for a provider
  async getOrCreateChat(providerId: string, userId: string) {
    // Verify provider exists
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      include: {
        user: true,
      },
    });

    if (!provider) throw new CustomError("Provider not found", 404);

    // Verify user is the provider or a contractor
    const isProvider = provider.user.id === userId;

    // Get only user role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) throw new CustomError("User not found", 404);

    // Verify permissions by role
    if (user.role === "PROVIDER" && !isProvider)
      throw new CustomError(
        "You don't have permission to access this chat",
        403
      );

    // Find existing chat
    let chat = await prisma.chat.findFirst({
      where: { providerId },
      include: {
        provider: true,
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    // If doesn't exist, create new one
    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          providerId,
        },
        include: {
          provider: true,
          messages: {
            include: {
              sender: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      });
    }

    return chat;
  }

  // Send message
  async sendMessage(data: {
    chatId: string;
    senderId: string;
    text?: string;
    attachmentUrl?: string;
    attachmentType?: string;
  }) {
    const { chatId, senderId, text, attachmentUrl, attachmentType } = data;

    // Verify chat exists
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        provider: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!chat) throw new CustomError("Chat not found", 404);

    // Verify user has permission to send messages in this chat
    const isProvider = chat.provider.user.id === senderId;

    // Get only sender role
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { role: true },
    });

    if (!sender) throw new CustomError("User not found", 404);

    // Only provider owners and contractors can send messages
    const isContractor = sender.role === "CONTRACTOR";

    if (!isProvider && !isContractor)
      throw new CustomError(
        "You don't have permission to send messages in this chat",
        403
      );

    if (!text && !attachmentUrl)
      throw new CustomError("You must provide text or an attachment", 400);

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId,
        text,
        attachmentUrl,
        attachmentType,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return message;
  }

  // Get messages from a chat
  async getMessages(chatId: string, userId: string) {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        provider: {
          include: {
            user: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!chat) {
      throw new CustomError("Chat not found", 404);
    }

    // Verify permissions
    const isProvider = chat.provider.user.id === userId;

    // Get only user role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) throw new CustomError("User not found", 404);

    // If provider, must be owner
    if (user.role === "PROVIDER" && !isProvider)
      throw new CustomError("You don't have permission to view this chat", 403);

    // If contractor, must have participated in chat
    if (user.role === "CONTRACTOR") {
      const hasParticipatedInChat = chat.messages.some(
        (message) => message.senderId === userId
      );

      if (!hasParticipatedInChat)
        throw new CustomError(
          "You don't have permission to view this chat. You must send at least one message first.",
          403
        );
    }

    return chat.messages;
  }

  // Get all chats for a user
  async getUserChats(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        providerProfile: true,
        contractorProfile: true,
      },
    });

    if (!user) throw new CustomError("User not found", 404);

    // Type for returned chats
    type ChatWithLastMessage = {
      id: string;
      providerId: string;
      createdAt: Date;
      provider: {
        id: string;
        title: string | null;
        fullName: string;
      };
      messages: Array<{
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
      }>;
    };

    let chats: ChatWithLastMessage[] = [];

    if (user.role === "PROVIDER" && user.providerProfile) {
      // Get provider chats
      chats = await prisma.chat.findMany({
        where: {
          providerId: user.providerProfile.id,
        },
        select: {
          id: true,
          providerId: true,
          createdAt: true,
          provider: {
            select: {
              id: true,
              title: true,
              fullName: true,
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              chatId: true,
              senderId: true,
              text: true,
              attachmentUrl: true,
              attachmentType: true,
              createdAt: true,
              sender: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else if (user.role === "CONTRACTOR") {
      // For contractors, get only chats where they have participated
      chats = await prisma.chat.findMany({
        where: {
          messages: {
            some: {
              senderId: userId,
            },
          },
        },
        select: {
          id: true,
          providerId: true,
          createdAt: true,
          provider: {
            select: {
              id: true,
              title: true,
              fullName: true,
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              chatId: true,
              senderId: true,
              text: true,
              attachmentUrl: true,
              attachmentType: true,
              createdAt: true,
              sender: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }
    return chats;
  }
}

export default new ChatService();
