import type { Express, Request } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGallerySchema, insertPhotoSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req: any, file: any, cb: any) => {
      const uploadDir = path.join(process.cwd(), "uploads");
      try {
        await fs.access(uploadDir);
      } catch {
        await fs.mkdir(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    cb(null, allowedTypes.includes(file.mimetype));
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), "uploads")));

  // Gallery routes
  app.get("/api/galleries", async (req, res) => {
    try {
      const galleries = await storage.getGalleries();
      res.json(galleries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch galleries" });
    }
  });

  app.get("/api/galleries/:slug", async (req, res) => {
    try {
      const gallery = await storage.getGalleryBySlug(req.params.slug);
      if (!gallery) {
        return res.status(404).json({ message: "Gallery not found" });
      }
      res.json(gallery);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gallery" });
    }
  });

  app.post("/api/galleries", async (req, res) => {
    try {
      const galleryData = insertGallerySchema.parse(req.body);
      const gallery = await storage.createGallery(galleryData);
      res.status(201).json(gallery);
    } catch (error) {
      res.status(400).json({ message: "Invalid gallery data" });
    }
  });

  app.put("/api/galleries/:id", async (req, res) => {
    try {
      const gallery = await storage.updateGallery(req.params.id, req.body);
      if (!gallery) {
        return res.status(404).json({ message: "Gallery not found" });
      }
      res.json(gallery);
    } catch (error) {
      res.status(500).json({ message: "Failed to update gallery" });
    }
  });

  app.delete("/api/galleries/:id", async (req, res) => {
    try {
      const success = await storage.deleteGallery(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Gallery not found" });
      }
      res.json({ message: "Gallery deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete gallery" });
    }
  });

  app.put("/api/galleries/:id/hero-image", async (req, res) => {
    try {
      const { photoId } = req.body;
      
      // Get the photo to use its URL as hero image
      const photo = await storage.getPhoto(photoId);
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }

      const gallery = await storage.updateGallery(req.params.id, { 
        heroImage: photo.url 
      });
      
      if (!gallery) {
        return res.status(404).json({ message: "Gallery not found" });
      }
      
      res.json(gallery);
    } catch (error) {
      res.status(500).json({ message: "Failed to update hero image" });
    }
  });

  // Photo routes
  app.get("/api/galleries/:galleryId/photos", async (req, res) => {
    try {
      const photos = await storage.getPhotosByGallery(req.params.galleryId);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  app.post("/api/galleries/:galleryId/photos", (req: any, res: any) => {
    upload.array('photos')(req, res, async (err: any) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: "File too large. Maximum size is 50MB per file." });
        }
        return res.status(400).json({ message: err.message || "Upload failed" });
      }

      try {
        if (!req.files || !Array.isArray(req.files)) {
          return res.status(400).json({ message: "No files uploaded" });
        }

        const photos = [];
        for (const file of req.files) {
          const photoData = {
            galleryId: req.params.galleryId,
            filename: file.filename,
            originalName: file.originalname,
            url: `/uploads/${file.filename}`,
            order: Date.now(), // Use timestamp for initial ordering
          };
          const photo = await storage.createPhoto(photoData);
          photos.push(photo);
        }

        res.status(201).json(photos);
      } catch (error) {
        res.status(500).json({ message: "Failed to upload photos" });
      }
    });
  });

  app.put("/api/photos/:id", async (req, res) => {
    try {
      const photo = await storage.updatePhoto(req.params.id, req.body);
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }
      res.json(photo);
    } catch (error) {
      res.status(500).json({ message: "Failed to update photo" });
    }
  });

  app.delete("/api/photos/:id", async (req, res) => {
    try {
      const photo = await storage.getPhoto(req.params.id);
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }

      // Delete file from filesystem
      try {
        await fs.unlink(path.join(process.cwd(), "uploads", photo.filename));
      } catch (error) {
        console.warn("Failed to delete file:", error);
      }

      const success = await storage.deletePhoto(req.params.id);
      res.json({ message: "Photo deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  app.put("/api/photos/:id/order", async (req, res) => {
    try {
      const { order } = req.body;
      const success = await storage.updatePhotoOrder(req.params.id, order);
      if (!success) {
        return res.status(404).json({ message: "Photo not found" });
      }
      res.json({ message: "Photo order updated" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update photo order" });
    }
  });

  // Admin authentication
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { password } = req.body;
      const adminPassword = await storage.getAdminSetting("password");
      
      if (!adminPassword || password !== adminPassword.value) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // In a real app, you'd use proper session management
      res.json({ message: "Login successful", authenticated: true });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/admin/change-password", async (req, res) => {
    try {
      const { newPassword } = req.body;
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      await storage.setAdminSetting({ key: "password", value: newPassword });
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
