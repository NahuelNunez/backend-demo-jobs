import prisma from "../../config/prisma";

class NotificationService {
  async createMessageNotification(data: {
    chatId: string;
    senderId: string;
    messageText?: string;
  }) {
    const { chatId, senderId, messageText } = data;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        provider: {
          include: { user: true },
        },
        messages: {
          select: { senderId: true },
          distinct: ["senderId"],
        },
      },
    });

    if (!chat) return [];

    const providerUserId = chat.provider.user.id;
    const isProviderSending = senderId === providerUserId;

    let recipientUserIds: string[] = [];

    if (isProviderSending) {
      // Notify all contractors who have participated in the chat
      const contractorIds = chat.messages
        .map((m) => m.senderId)
        .filter((id) => id !== providerUserId);
      recipientUserIds = [...new Set(contractorIds)];
    } else {
      // Notify the provider
      recipientUserIds = [providerUserId];
    }

    if (recipientUserIds.length === 0) return [];

    const body = messageText
      ? messageText.substring(0, 120)
      : "Has recibido un adjunto";

    const notifications = await Promise.all(
      recipientUserIds.map((userId) =>
        prisma.notification.create({
          data: {
            userId,
            type: "new_message",
            title: "Nuevo mensaje",
            body,
            chatId,
            isRead: false,
          },
        })
      )
    );

    return notifications;
  }

  async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

export default new NotificationService();
