import { type Gallery, type Photo, type AdminSettings, type InsertGallery, type InsertPhoto, type InsertAdminSettings } from "@shared/schema";
import { randomUUID } from "crypto";

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
  
  // Admin settings methods
  getAdminSetting(key: string): Promise<AdminSettings | undefined>;
  setAdminSetting(setting: InsertAdminSettings): Promise<AdminSettings>;
  getHomepagePhoto(): Promise<string | undefined>;
  setHomepagePhoto(photoUrl: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private galleries: Map<string, Gallery>;
  private photos: Map<string, Photo>;
  private adminSettings: Map<string, AdminSettings>;

  constructor() {
    this.galleries = new Map();
    this.photos = new Map();
    this.adminSettings = new Map();
    
    // Initialize with default password
    this.setAdminSetting({ key: "password", value: "100301" });
    
    // Initialize with default galleries
    this.initializeDefaultGalleries();
  }

  private async initializeDefaultGalleries() {
    const defaultGalleries = [
      { name: "Fashion", slug: "fashion", description: "High fashion and editorial photography", order: 1 },
      { name: "Beauty", slug: "beauty", description: "Beauty and cosmetic photography", order: 2 },
      { name: "Travel", slug: "travel", description: "Travel and landscape photography", order: 3 },
      { name: "Portrait", slug: "portrait", description: "Professional portrait photography", order: 4 },
      { name: "Conceptual", slug: "conceptual", description: "Artistic and conceptual photography", order: 5 },
    ];

    for (const gallery of defaultGalleries) {
      await this.createGallery(gallery);
    }
  }

  async getGalleries(): Promise<Gallery[]> {
    return Array.from(this.galleries.values()).sort((a, b) => a.order - b.order);
  }

  async getGallery(id: string): Promise<Gallery | undefined> {
    return this.galleries.get(id);
  }

  async getGalleryBySlug(slug: string): Promise<Gallery | undefined> {
    return Array.from(this.galleries.values()).find(gallery => gallery.slug === slug);
  }

  async createGallery(insertGallery: InsertGallery): Promise<Gallery> {
    const id = randomUUID();
    const gallery: Gallery = {
      ...insertGallery,
      id,
      description: insertGallery.description || null,
      coverImage: insertGallery.coverImage || null,
      heroImage: insertGallery.heroImage || null,
      order: insertGallery.order || 0,
      createdAt: new Date(),
    };
    this.galleries.set(id, gallery);
    return gallery;
  }

  async updateGallery(id: string, updates: Partial<Gallery>): Promise<Gallery | undefined> {
    const gallery = this.galleries.get(id);
    if (!gallery) return undefined;
    
    const updatedGallery = { ...gallery, ...updates };
    this.galleries.set(id, updatedGallery);
    return updatedGallery;
  }

  async deleteGallery(id: string): Promise<boolean> {
    // Also delete all photos in this gallery
    const photos = Array.from(this.photos.values()).filter(photo => photo.galleryId === id);
    photos.forEach(photo => this.photos.delete(photo.id));
    
    return this.galleries.delete(id);
  }

  async reorderGalleries(galleryIds: string[]): Promise<boolean> {
    try {
      console.log("Reordering galleries in storage:", galleryIds);
      console.log("Current galleries:", Array.from(this.galleries.entries()).map(([id, g]) => ({id, name: g.name, order: g.order})));
      
      galleryIds.forEach((id, index) => {
        const gallery = this.galleries.get(id);
        if (gallery) {
          const updatedGallery = { ...gallery, order: index };
          this.galleries.set(id, updatedGallery);
          console.log(`Updated gallery ${id} (${gallery.name}) to order ${index}`);
        } else {
          console.log(`Gallery ${id} not found`);
        }
      });
      
      console.log("After reorder:", Array.from(this.galleries.entries()).map(([id, g]) => ({id, name: g.name, order: g.order})));
      return true;
    } catch (error) {
      console.error("Reorder error in storage:", error);
      return false;
    }
  }

  async getPhotosByGallery(galleryId: string): Promise<Photo[]> {
    return Array.from(this.photos.values())
      .filter(photo => photo.galleryId === galleryId)
      .sort((a, b) => a.order - b.order);
  }

  async getPhoto(id: string): Promise<Photo | undefined> {
    return this.photos.get(id);
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = randomUUID();
    const photo: Photo = {
      ...insertPhoto,
      id,
      order: insertPhoto.order || 0,
      createdAt: new Date(),
    };
    this.photos.set(id, photo);
    return photo;
  }

  async updatePhoto(id: string, updates: Partial<Photo>): Promise<Photo | undefined> {
    const photo = this.photos.get(id);
    if (!photo) return undefined;
    
    const updatedPhoto = { ...photo, ...updates };
    this.photos.set(id, updatedPhoto);
    return updatedPhoto;
  }

  async deletePhoto(id: string): Promise<boolean> {
    return this.photos.delete(id);
  }

  async updatePhotoOrder(photoId: string, newOrder: number): Promise<boolean> {
    const photo = this.photos.get(photoId);
    if (!photo) return false;
    
    photo.order = newOrder;
    this.photos.set(photoId, photo);
    return true;
  }

  async getAdminSetting(key: string): Promise<AdminSettings | undefined> {
    return this.adminSettings.get(key);
  }

  async setAdminSetting(setting: InsertAdminSettings): Promise<AdminSettings> {
    const existing = this.adminSettings.get(setting.key);
    const adminSetting: AdminSettings = {
      id: existing?.id || randomUUID(),
      key: setting.key,
      value: setting.value,
      updatedAt: new Date(),
    };
    this.adminSettings.set(setting.key, adminSetting);
    return adminSetting;
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

export const storage = new MemStorage();
