import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Upload, Image, Star, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Gallery, type Photo } from "@shared/schema";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';

interface SortablePhotoProps {
  photo: Photo;
  isHeroImage: boolean;
  onSetHeroImage: (photoId: string, originalName: string) => void;
  onDeletePhoto: (photoId: string, originalName: string) => void;
  setHeroImagePending: boolean;
  deletePhotoPending: boolean;
}

function SortablePhoto({ 
  photo, 
  isHeroImage, 
  onSetHeroImage, 
  onDeletePhoto, 
  setHeroImagePending, 
  deletePhotoPending 
}: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <div className="absolute top-2 right-2 z-10 bg-white bg-opacity-80 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" 
           {...attributes} 
           {...listeners}>
        <GripVertical className="h-4 w-4 text-gray-600" />
      </div>
      
      <img
        src={photo.url}
        alt={photo.originalName}
        className={`w-full aspect-square object-cover rounded border-2 ${
          isHeroImage ? 'border-gold' : 'border-gray-200'
        }`}
      />
      
      {isHeroImage && (
        <div className="absolute top-2 left-2 bg-gold text-black rounded-full p-1">
          <Star className="h-3 w-3 fill-current" />
        </div>
      )}
      
      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onSetHeroImage(photo.id, photo.originalName)}
          disabled={setHeroImagePending || isHeroImage}
          title="Set as hero image"
        >
          <Star className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDeletePhoto(photo.id, photo.originalName)}
          disabled={deletePhotoPending}
          title="Delete photo"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function PhotoManagement() {
  const [selectedGalleryId, setSelectedGalleryId] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [localPhotos, setLocalPhotos] = useState<Photo[]>([]);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: galleries } = useQuery<Gallery[]>({
    queryKey: ["/api/galleries"],
  });

  const { data: photos, isLoading: photosLoading } = useQuery<Photo[]>({
    queryKey: ["/api/galleries", selectedGalleryId, "photos"],
    enabled: !!selectedGalleryId,
  });

  // Update local photos when server data changes
  useEffect(() => {
    if (photos) {
      setLocalPhotos(photos);
    }
  }, [photos]);

  const uploadPhotosMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/galleries/${selectedGalleryId}/photos`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/galleries", selectedGalleryId, "photos"] });
      toast({
        title: "Photos uploaded",
        description: `${data.length} photos uploaded successfully`,
      });
      setSelectedFiles(null);
      // Reset file input
      const fileInput = document.getElementById('photoUpload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      await apiRequest("DELETE", `/api/photos/${photoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/galleries", selectedGalleryId, "photos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/galleries"] });
      toast({
        title: "Photo deleted",
        description: "Photo has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive",
      });
    },
  });

  const setHeroImageMutation = useMutation({
    mutationFn: async ({ galleryId, photoId }: { galleryId: string; photoId: string }) => {
      await apiRequest("PUT", `/api/galleries/${galleryId}/hero-image`, { photoId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/galleries"] });
      toast({
        title: "Hero image updated",
        description: "Gallery hero image has been set successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to set hero image",
        variant: "destructive",
      });
    },
  });

  const reorderPhotosMutation = useMutation({
    mutationFn: async (photoIds: string[]) => {
      await apiRequest("PUT", `/api/galleries/${selectedGalleryId}/photos/reorder`, { photoIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/galleries", selectedGalleryId, "photos"] });
      toast({
        title: "Photos reordered",
        description: "Photo order has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reorder photos",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const handleUpload = () => {
    if (!selectedFiles || !selectedGalleryId) {
      toast({
        title: "Missing information",
        description: "Please select gallery and files",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => {
      formData.append('photos', file);
    });

    uploadPhotosMutation.mutate(formData);
  };

  const handleDeletePhoto = (photoId: string, originalName: string) => {
    if (confirm(`Are you sure you want to delete "${originalName}"?`)) {
      deletePhotoMutation.mutate(photoId);
    }
  };

  const handleSetHeroImage = (photoId: string, originalName: string) => {
    if (confirm(`Set "${originalName}" as the hero image for this gallery?`)) {
      setHeroImageMutation.mutate({ galleryId: selectedGalleryId, photoId });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = localPhotos.findIndex((photo) => photo.id === active.id);
      const newIndex = localPhotos.findIndex((photo) => photo.id === over?.id);

      const newPhotos = arrayMove(localPhotos, oldIndex, newIndex);
      setLocalPhotos(newPhotos);

      // Update server with new order
      const photoIds = newPhotos.map(photo => photo.id);
      reorderPhotosMutation.mutate(photoIds);
    }
  };

  const selectedGallery = galleries?.find(g => g.id === selectedGalleryId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-light">Photo Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gallery selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Gallery</label>
          <Select value={selectedGalleryId} onValueChange={setSelectedGalleryId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a gallery" />
            </SelectTrigger>
            <SelectContent>
              {galleries?.map((gallery) => (
                <SelectItem key={gallery.id} value={gallery.id}>
                  {gallery.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Photo upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Upload Photos</label>
          <Input
            id="photoUpload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={!selectedGalleryId}
          />
          {selectedFiles && (
            <p className="text-sm text-gray-600">
              {selectedFiles.length} file(s) selected
            </p>
          )}
          <Button
            onClick={handleUpload}
            disabled={!selectedFiles || !selectedGalleryId || uploadPhotosMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploadPhotosMutation.isPending ? "Uploading..." : "Upload Photos"}
          </Button>
        </div>

        {/* Photo list */}
        {selectedGalleryId && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Photos in Gallery</h4>
              <p className="text-sm text-gray-600">Drag photos to reorder them. Click the star to set as hero image.</p>
              {selectedGallery?.heroImage && (
                <p className="text-sm text-gray-600">
                  Current hero image: <span className="text-green-600">Set</span>
                </p>
              )}
            </div>
            {photosLoading ? (
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded"></div>
                ))}
              </div>
            ) : localPhotos && localPhotos.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={localPhotos.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                    {localPhotos.map((photo) => {
                      const isHeroImage = selectedGallery?.heroImage === photo.url;
                      return (
                        <SortablePhoto
                          key={photo.id}
                          photo={photo}
                          isHeroImage={isHeroImage}
                          onSetHeroImage={handleSetHeroImage}
                          onDeletePhoto={handleDeletePhoto}
                          setHeroImagePending={setHeroImageMutation.isPending}
                          deletePhotoPending={deletePhotoMutation.isPending}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No photos in this gallery</p>
                <p className="text-sm">Upload photos to set a hero image</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
