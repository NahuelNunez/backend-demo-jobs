import { Request, Response } from "express";
import { profileService } from "./profile.service";
import { ProviderStatus } from "@prisma/client";

export const profileController = {
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const profile = await profileService.getProfile(userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Error fetching profile",
      });
    }
  },

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const data = req.body;

      const profile = await profileService.updateProfile(userId, data);

      res.status(200).json({
        success: true,
        data: profile,
        message: "Profile updated successfully",
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Error updating profile",
      });
    }
  },

  // ==================== APPLICATION CONTROLLERS ====================

  async updateApplication(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { title, description, category, estimatedPrice } = req.body;

      const profile = await profileService.updateProviderApplication(
        userId,
        { title, description, category, estimatedPrice }
      );

      res.status(200).json({
        success: true,
        data: profile,
        message: "Application updated successfully",
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Error updating application",
      });
    }
  },

  async updateApplicationVideo(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const videoFile = req.file;

      if (!videoFile) {
        return res.status(400).json({
          success: false,
          message: "No video file provided",
        });
      }

      const profile = await profileService.updateApplicationVideo(
        userId,
        videoFile
      );

      res.status(200).json({
        success: true,
        data: profile,
        message: "Video updated successfully",
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Error updating video",
      });
    }
  },

  async deleteApplicationVideo(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      const profile = await profileService.deleteApplicationVideo(userId);

      res.status(200).json({
        success: true,
        data: profile,
        message: "Video deleted successfully",
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Error deleting video",
      });
    }
  },

  async changeApplicationStatus(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { status } = req.body;

      if (!status || !Object.values(ProviderStatus).includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      const profile = await profileService.changeApplicationStatus(
        userId,
        status
      );

      res.status(200).json({
        success: true,
        data: profile,
        message: "Status updated successfully",
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Error changing status",
      });
    }
  },

  // ==================== PUBLIC CONTROLLERS ====================

  async getProviders(req: Request, res: Response) {
    try {
      const { category, status, search, page, limit } = req.query;

      // Get filters from headers
      const headerCategory = req.headers['x-category'] as string;
      const headerStatus = req.headers['x-status'] as string;
      const headerSearch = req.headers['x-search'] as string;
      const headerLocation = req.headers['x-location'] as string;
      const headerSortBy = req.headers['x-sort-by'] as string;
      const headerSortOrder = req.headers['x-sort-order'] as string;

      const filters: any = {};
      // Query params have priority over headers
      if (category) filters.category = category as string;
      else if (headerCategory) filters.category = headerCategory;
      
      if (status) filters.status = status as ProviderStatus;
      else if (headerStatus) filters.status = headerStatus as ProviderStatus;
      
      if (search) filters.search = search as string;
      else if (headerSearch) filters.search = headerSearch;
      
      // Additional filters from headers only
      if (headerLocation) filters.location = headerLocation;
      if (headerSortBy) filters.sortBy = headerSortBy;
      if (headerSortOrder) filters.sortOrder = headerSortOrder;

      // Parse pagination parameters
      const pageNumber = page ? parseInt(page as string) : 1;
      const pageSize = limit ? parseInt(limit as string) : 10;

      const result = await profileService.getActiveProviders(
        filters,
        pageNumber,
        pageSize
      );

      res.status(200).json({
        success: true,
        data: result.providers,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Error fetching providers",
      });
    }
  },

  async getProviderById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const provider = await profileService.getProviderById(id);

      res.status(200).json({
        success: true,
        data: provider,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Error fetching provider",
      });
    }
  },

  async getCategories(req: Request, res: Response) {
    try {
      const categories = await profileService.getAvailableCategories();

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Error fetching categories",
      });
    }
  },
};
