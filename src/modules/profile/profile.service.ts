import prisma from "../../config/prisma";
import { CustomError } from "../../utils/customError";
import cloudinaryService from "../../utils/cloudinary.service";
import { ProviderStatus } from "@prisma/client";

export const profileService = {
  async getProfile(userId: string) {
    // Find user with profiles
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        contractorProfile: true,
        providerProfile: true,
      },
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      profile:
        user.role === "CONTRACTOR"
          ? user.contractorProfile
          : user.providerProfile,
    };
  },

  async updateProfile(userId: string, data: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        contractorProfile: true,
        providerProfile: true,
      },
    });

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    if (user.role === "CONTRACTOR") {
      if (!user.contractorProfile) {
        throw new CustomError("Contractor profile not found", 404);
      }

      const updatedProfile = await prisma.contractorProfile.update({
        where: { id: user.contractorProfile.id },
        data: {
          fullName: data.fullName,
          username: data.username,
          cuit: data.cuit,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          phone: data.phone,
        },
      });

      return updatedProfile;
    } else if (user.role === "PROVIDER") {
      if (!user.providerProfile) {
        throw new CustomError("Provider profile not found", 404);
      }

      const updatedProfile = await prisma.providerProfile.update({
        where: { id: user.providerProfile.id },
        data: {
          fullName: data.fullName,
          username: data.username,
          trade: data.trade,
          experience: data.experience ? parseInt(data.experience) : null,
          description: data.description,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          profileComplete: true, // Mark as complete when updating
        },
      });

      return updatedProfile;
    }

    throw new CustomError("Invalid user role", 400);
  },

  // ==================== APPLICATION METHODS ====================

  async updateProviderApplication(
    userId: string,
    data: {
      title?: string;
      description?: string;
      category?: string;
      estimatedPrice?: number;
    }
  ) {
    // Get provider profile
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!providerProfile) {
      throw new CustomError(
        "You must have a provider profile to update the application",
        403
      );
    }

    // Validate profile is complete
    if (!providerProfile.profileComplete) {
      throw new CustomError(
        "You must complete your profile before creating/updating an application",
        400
      );
    }

    // Update application in profile
    const updatedProfile = await prisma.providerProfile.update({
      where: { id: providerProfile.id },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        estimatedPrice: data.estimatedPrice,
        applicationCreatedAt:
          providerProfile.applicationCreatedAt || new Date(),
      },
    });

    return updatedProfile;
  },

  async updateApplicationVideo(userId: string, videoFile: Express.Multer.File) {
    // Get provider profile
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!providerProfile) {
      throw new CustomError(
        "You must have a provider profile to upload a video",
        403
      );
    }

    // If there's already a video, delete it first
    if (providerProfile.videoKey) {
      try {
        await cloudinaryService.eliminarVideo(providerProfile.videoKey);
      } catch (error) {
        console.error("Error deleting previous video:", error);
      }
    }

    // Upload new video
    let videoData;
    try {
      videoData = (await cloudinaryService.subirVideo(
        videoFile.buffer,
        "applications/videos",
        `provider_${providerProfile.id}_${Date.now()}`
      )) as {
        videoUrl: string;
        videoClave: string;
        videoUrlMiniatura: string;
        videoDuracionSegundos: number;
        videoTipoMime: string;
      };
    } catch (error: any) {
      throw new CustomError(`Error uploading video: ${error.message}`, 500);
    }

    // Update profile with video data
    const updatedProfile = await prisma.providerProfile.update({
      where: { id: providerProfile.id },
      data: {
        videoUrl: videoData.videoUrl,
        videoKey: videoData.videoClave,
        videoThumbnailUrl: videoData.videoUrlMiniatura,
        videoDurationSeconds: videoData.videoDuracionSegundos,
        videoMimeType: videoData.videoTipoMime,
      },
    });

    return updatedProfile;
  },

  async deleteApplicationVideo(userId: string) {
    // Get provider profile
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!providerProfile) {
      throw new CustomError("You must have a provider profile", 403);
    }

    if (!providerProfile.videoKey) {
      throw new CustomError("No video to delete", 404);
    }

    // Delete video from Cloudinary
    try {
      await cloudinaryService.eliminarVideo(providerProfile.videoKey);
    } catch (error) {
      console.error("Error deleting video from Cloudinary:", error);
    }

    // Clear video fields in profile
    const updatedProfile = await prisma.providerProfile.update({
      where: { id: providerProfile.id },
      data: {
        videoUrl: null,
        videoKey: null,
        videoThumbnailUrl: null,
        videoDurationSeconds: null,
        videoMimeType: null,
      },
    });

    return updatedProfile;
  },

  async changeApplicationStatus(userId: string, status: ProviderStatus) {
    // Get provider profile
    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId },
    });

    if (!providerProfile) {
      throw new CustomError("You must have a provider profile", 403);
    }

    // Validate complete application before activating
    if (status === "ACTIVE") {
      if (!providerProfile.title || !providerProfile.description) {
        throw new CustomError(
          "You must complete the application data before activating it",
          400
        );
      }
    }

    // Update status
    const updatedProfile = await prisma.providerProfile.update({
      where: { id: providerProfile.id },
      data: { status },
    });

    return updatedProfile;
  },

  // ==================== PUBLIC METHODS ====================

  async getActiveProviders(
    filters?: {
      category?: string;
      status?: ProviderStatus;
      search?: string;
      location?: string;
      sortBy?: string;
      sortOrder?: string;
    },
    page: number = 1,
    limit: number = 10
  ) {
    const where: any = {
      profileComplete: true,
      title: { not: null },
    };

    // Apply filters
    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.status) {
      where.status = filters.status;
    } else {
      // By default, only show active
      where.status = "ACTIVE";
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
        { fullName: { contains: filters.search } },
        { trade: { contains: filters.search } },
      ];
    }

    // Location filter
    if (filters?.location) {
      where.OR = [
        ...(where.OR || []),
        { city: { contains: filters.location } },
        { state: { contains: filters.location } },
        { address: { contains: filters.location } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const total = await prisma.providerProfile.count({ where });

    // Determine sorting
    const sortBy = filters?.sortBy || "applicationCreatedAt";
    const sortOrder = filters?.sortOrder?.toLowerCase() === "asc" ? "asc" : "desc";
    
    // Valid sort fields
    const validSortFields = [
      "applicationCreatedAt",
      "fullName",
      "category",
      "estimatedPrice",
      "experience",
      "averageRating",
    ];

    const orderByField = validSortFields.includes(sortBy) 
      ? sortBy 
      : "applicationCreatedAt";

    // Get paginated providers
    const providers = await prisma.providerProfile.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        [orderByField]: sortOrder,
      },
    });

    return {
      providers,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getProviderById(providerId: string) {
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!provider) {
      throw new CustomError("Provider not found", 404);
    }

    return provider;
  },

  async getAvailableCategories() {
    const categories = await prisma.providerProfile.findMany({
      where: {
        category: {
          not: null,
        },
        status: "ACTIVE",
      },
      select: {
        category: true,
      },
      distinct: ["category"],
    });

    return categories
      .map((c) => c.category)
      .filter((c) => c !== null)
      .sort();
  },
};
