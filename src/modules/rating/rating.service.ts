import prisma from "../../config/prisma";
import { CustomError } from "../../utils/customError";

export const ratingService = {
  /**
   * Crear o actualizar una calificación
   */
  async createOrUpdateRating(
    contractorUserId: string,
    providerId: string,
    rating: number,
    comment?: string
  ) {
    // Validar rating
    if (rating < 1 || rating > 5) {
      throw new CustomError("La calificación debe estar entre 1 y 5", 400);
    }

    // Verificar que el proveedor existe
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new CustomError("Proveedor no encontrado", 404);
    }

    // Obtener el perfil del contratador
    const contractor = await prisma.contractorProfile.findUnique({
      where: { userId: contractorUserId },
    });

    if (!contractor) {
      throw new CustomError("Perfil de contratador no encontrado", 404);
    }

    // Verificar que el contratador no califique a sí mismo
    if (provider.userId === contractorUserId) {
      throw new CustomError("No puedes calificarte a ti mismo", 400);
    }

    // Buscar si ya existe una calificación
    const existingRating = await prisma.rating.findUnique({
      where: {
        providerId_contractorProfileId: {
          providerId,
          contractorProfileId: contractor.id,
        },
      },
    });

    let ratingRecord;

    if (existingRating) {
      // Actualizar calificación existente
      ratingRecord = await prisma.rating.update({
        where: { id: existingRating.id },
        data: {
          rating,
          comment,
        },
        include: {
          contractor: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
        },
      });
    } else {
      // Crear nueva calificación
      ratingRecord = await prisma.rating.create({
        data: {
          providerId,
          contractorProfileId: contractor.id,
          rating,
          comment,
        },
        include: {
          contractor: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
        },
      });
    }

    // Recalcular el promedio y total de calificaciones del proveedor
    await this.updateProviderRatingStats(providerId);

    return ratingRecord;
  },

  /**
   * Obtener todas las calificaciones de un proveedor
   */
  async getProviderRatings(providerId: string) {
    // Verificar que el proveedor existe
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      select: {
        id: true,
        fullName: true,
        averageRating: true,
        totalRatings: true,
      },
    });

    if (!provider) {
      throw new CustomError("Proveedor no encontrado", 404);
    }

    // Obtener todas las calificaciones con información del contratador
    const ratings = await prisma.rating.findMany({
      where: { providerId },
      include: {
        contractor: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      provider,
      ratings,
    };
  },

  /**
   * Obtener la calificación de un contratador específico para un proveedor
   */
  async getMyRatingForProvider(contractorUserId: string, providerId: string) {
    // Obtener el perfil del contratador
    const contractor = await prisma.contractorProfile.findUnique({
      where: { userId: contractorUserId },
    });

    if (!contractor) {
      throw new CustomError("Perfil de contratador no encontrado", 404);
    }

    // Buscar la calificación
    const rating = await prisma.rating.findUnique({
      where: {
        providerId_contractorProfileId: {
          providerId,
          contractorProfileId: contractor.id,
        },
      },
    });

    return rating;
  },

  /**
   * Eliminar una calificación
   */
  async deleteRating(contractorUserId: string, providerId: string) {
    // Obtener el perfil del contratador
    const contractor = await prisma.contractorProfile.findUnique({
      where: { userId: contractorUserId },
    });

    if (!contractor) {
      throw new CustomError("Perfil de contratador no encontrado", 404);
    }

    // Buscar la calificación
    const rating = await prisma.rating.findUnique({
      where: {
        providerId_contractorProfileId: {
          providerId,
          contractorProfileId: contractor.id,
        },
      },
    });

    if (!rating) {
      throw new CustomError("Calificación no encontrada", 404);
    }

    // Eliminar la calificación
    await prisma.rating.delete({
      where: { id: rating.id },
    });

    // Recalcular las estadísticas del proveedor
    await this.updateProviderRatingStats(providerId);

    return { message: "Calificación eliminada exitosamente" };
  },

  /**
   * Actualizar las estadísticas de calificación de un proveedor
   */
  async updateProviderRatingStats(providerId: string) {
    // Calcular el promedio y total de calificaciones
    const stats = await prisma.rating.aggregate({
      where: { providerId },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    const averageRating = stats._avg.rating || 0;
    const totalRatings = stats._count.rating || 0;

    // Actualizar el perfil del proveedor
    await prisma.providerProfile.update({
      where: { id: providerId },
      data: {
        averageRating: Math.round(averageRating * 10) / 10, // Redondear a 1 decimal
        totalRatings,
      },
    });

    return { averageRating, totalRatings };
  },

  /**
   * Obtener resumen de calificaciones por estrellas
   */
  async getRatingSummary(providerId: string) {
    // Verificar que el proveedor existe
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new CustomError("Proveedor no encontrado", 404);
    }

    // Obtener todas las calificaciones
    const ratings = await prisma.rating.findMany({
      where: { providerId },
      select: { rating: true },
    });

    // Contar calificaciones por estrellas
    const summary = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    ratings.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        summary[r.rating as keyof typeof summary]++;
      }
    });

    return {
      averageRating: provider.averageRating,
      totalRatings: provider.totalRatings,
      distribution: summary,
    };
  },
};
