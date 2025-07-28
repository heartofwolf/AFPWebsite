import { type Gallery, type Photo, type AdminSettings, type InsertGallery, type InsertPhoto, type InsertAdminSettings, galleries, photos, adminSettings } from "@shared/schema";
import { db } from "./db";
import { eq, asc } from "drizzle-orm";

export interface IStorage {
  // Gallery methods
  getGalleries(): Promise<Gallery[]>;
  getGallery(id: string): Promise<Gallery | undefined>;
  getGalleryBySlug(slug: string): Promise<Gallery | undefined>;
  createGallery(gallery: InsertGallery): Promise<Gallery>;
  updateGallery(id: string, gallery: Partial<Gallery>): Promise<Gallery | undefined>;
  reorderGalleries(galleryIds: string[]): Promise<boolean>;
  deleteGallery(id: string): Promise<boolean>;
  
  // Photo methods  
  getPhotosByGallery(galleryId: string): Promise<Photo[]>;
  getPhoto(id: string): Promise<Photo | undefined>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  updatePhoto(id: string, photo: Partial<Photo>): Promise<Photo | undefined>;
  deletePhoto(id: string): Promise<boolean>;
  updatePhotoOrder(photoId: string, newOrder: number): Promise<boolean>;
  reorderPhotos(galleryId: string, photoIds: string[]): Promise<boolean>;
  
  // Admin settings methods
  getAdminSetting(key: string): Promise<AdminSettings | undefined>;
  setAdminSetting(setting: InsertAdminSettings): Promise<AdminSettings>;
  getHomepagePhoto(): Promise<string | undefined>;
  setHomepagePhoto(photoUrl: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    try {
      // Check if we have any galleries, if not, create default ones
      const existingGalleries = await db.select().from(galleries).limit(1);
      
      if (existingGalleries.length === 0) {
        const defaultGalleries = [
          { name: "Fashion", slug: "fashion", description: "High fashion and editorial photography", order: 1 },
          { name: "Beauty", slug: "beauty", description: "Beauty and cosmetic photography", order: 2 },
          { name: "Travel", slug: "travel", description: "Travel and landscape photography", order: 3 },
          { name: "Portrait", slug: "portrait", description: "Professional portrait photography", order: 4 },
          { name: "Conceptual", slug: "conceptual", description: "Artistic and conceptual photography", order: 5 },
        ];

        await db.insert(galleries).values(defaultGalleries);
      }

      // Initialize admin settings if they don't exist
      const existingSettings = await db.select().from(adminSettings).where(eq(adminSettings.key, "password")).limit(1);
      if (existingSettings.length === 0) {
        await db.insert(adminSettings).values({
          key: "password",
          value: "100301",
        });
      }
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  async getGalleries(): Promise<Gallery[]> {
    return await db.select().from(galleries).orderBy(asc(galleries.order));
  }

  async getGallery(id: string): Promise<Gallery | undefined> {
    const [gallery] = await db.select().from(galleries).where(eq(galleries.id, id));
    return gallery || undefined;
  }

  async getGalleryBySlug(slug: string): Promise<Gallery | undefined> {
    const [gallery] = await db.select().from(galleries).where(eq(galleries.slug, slug));
    return gallery || undefined;
  }

  async createGallery(insertGallery: InsertGallery): Promise<Gallery> {
    const [newGallery] = await db.insert(galleries).values(insertGallery).returning();
    return newGallery;
  }

  async updateGallery(id: string, updates: Partial<Gallery>): Promise<Gallery | undefined> {
    const [updatedGallery] = await db
      .update(galleries)
      .set(updates)
      .where(eq(galleries.id, id))
      .returning();
    return updatedGallery || undefined;
  }

  async deleteGallery(id: string): Promise<boolean> {
    try {
      // Delete all photos in this gallery first
      await db.delete(photos).where(eq(photos.galleryId, id));
      
      await db.delete(galleries).where(eq(galleries.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  async reorderGalleries(galleryIds: string[]): Promise<boolean> {
    try {
      for (let i = 0; i < galleryIds.length; i++) {
        await db
          .update(galleries)
          .set({ order: i })
          .where(eq(galleries.id, galleryIds[i]));
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  async getPhotosByGallery(galleryId: string): Promise<Photo[]> {
    return await db
      .select()
      .from(photos)
      .where(eq(photos.galleryId, galleryId))
      .orderBy(asc(photos.order));
  }

  async getPhoto(id: string): Promise<Photo | undefined> {
    const [photo] = await db.select().from(photos).where(eq(photos.id, id));
    return photo || undefined;
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const [newPhoto] = await db.insert(photos).values(insertPhoto).returning();
    return newPhoto;
  }

  async updatePhoto(id: string, updates: Partial<Photo>): Promise<Photo | undefined> {
    const [updatedPhoto] = await db
      .update(photos)
      .set(updates)
      .where(eq(photos.id, id))
      .returning();
    return updatedPhoto || undefined;
  }

  async deletePhoto(id: string): Promise<boolean> {
    try {
      await db.delete(photos).where(eq(photos.id, id));
      return true;
    } catch (error) {
      return false;
    }
  }

  async updatePhotoOrder(photoId: string, newOrder: number): Promise<boolean> {
    try {
      await db
        .update(photos)
        .set({ order: newOrder })
        .where(eq(photos.id, photoId));
      return true;
    } catch (error) {
      return false;
    }
  }

  async reorderPhotos(galleryId: string, photoIds: string[]): Promise<boolean> {
    try {
      for (let i = 0; i < photoIds.length; i++) {
        await db
          .update(photos)
          .set({ order: i })
          .where(eq(photos.id, photoIds[i]));
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  async getAdminSetting(key: string): Promise<AdminSettings | undefined> {
    const [setting] = await db.select().from(adminSettings).where(eq(adminSettings.key, key));
    return setting || undefined;
  }

  async setAdminSetting(setting: InsertAdminSettings): Promise<AdminSettings> {
    const existing = await this.getAdminSetting(setting.key);
    
    if (existing) {
      const [updatedSetting] = await db
        .update(adminSettings)
        .set({ value: setting.value })
        .where(eq(adminSettings.key, setting.key))
        .returning();
      return updatedSetting;
    } else {
      const [newSetting] = await db.insert(adminSettings).values(setting).returning();
      return newSetting;
    }
  }

  async getHomepagePhoto(): Promise<string | undefined> {
    const setting = await this.getAdminSetting("homepage_photo");
    return setting?.value;
  }

  async setHomepagePhoto(photoUrl: string): Promise<boolean> {
    try {
      await this.setAdminSetting({ key: "homepage_photo", value: photoUrl });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
