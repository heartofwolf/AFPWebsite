import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, GripVertical, Edit2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Gallery } from "@shared/schema";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableGalleryItemProps {
  gallery: Gallery;
  isEditing: boolean;
  editName: string;
  onEdit: (id: string) => void;
  onSave: (id: string) => void;
  onCancel: () => void;
  onDelete: (id: string, name: string) => void;
  onEditNameChange: (name: string) => void;
  disabled: boolean;
}

function SortableGalleryItem({
  gallery,
  isEditing,
  editName,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onEditNameChange,
  disabled
}: SortableGalleryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: gallery.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 bg-gray-50 rounded border"
    >
      <div className="flex items-center space-x-2 flex-1">
        <div {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
        </div>
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <Input
                value={editName}
                onChange={(e) => onEditNameChange(e.target.value)}
                className="h-8"
                onKeyPress={(e) => e.key === 'Enter' && onSave(gallery.id)}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onSave(gallery.id)}
                className="h-8 w-8 p-0"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancel}
                className="h-8 w-8 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div>
              <div className="font-medium">{gallery.name}</div>
              <div className="text-sm text-gray-500">/{gallery.slug}</div>
            </div>
          )}
        </div>
      </div>
      {!isEditing && (
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(gallery.id)}
            disabled={disabled}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(gallery.id, gallery.name)}
            disabled={disabled}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function GalleryManagement() {
  const [newGalleryName, setNewGalleryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: galleries, isLoading } = useQuery<Gallery[]>({
    queryKey: ["/api/galleries"],
  });

  const createGalleryMutation = useMutation({
    mutationFn: async (data: { name: string; slug: string; description?: string; order: number }) => {
      const response = await apiRequest("POST", "/api/galleries", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/galleries"] });
      toast({
        title: "Gallery created",
        description: "New gallery has been created successfully",
      });
      setNewGalleryName("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create gallery",
        variant: "destructive",
      });
    },
  });

  const deleteGalleryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/galleries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/galleries"] });
      toast({
        title: "Gallery deleted",
        description: "Gallery has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete gallery",
        variant: "destructive",
      });
    },
  });

  const updateGalleryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Gallery> }) => {
      const response = await apiRequest("PUT", `/api/galleries/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/galleries"] });
      toast({
        title: "Gallery updated",
        description: "Gallery has been updated successfully",
      });
      setEditingId(null);
      setEditName("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update gallery",
        variant: "destructive",
      });
    },
  });

  const reorderGalleriesMutation = useMutation({
    mutationFn: async (galleryIds: string[]) => {
      await apiRequest("PUT", "/api/galleries/reorder", { galleryIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/galleries"] });
      toast({
        title: "Gallery order updated",
        description: "Gallery order has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update gallery order",
        variant: "destructive",
      });
    },
  });

  const handleCreateGallery = () => {
    if (!newGalleryName.trim()) return;

    const slug = newGalleryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const order = (galleries?.length || 0) + 1;

    createGalleryMutation.mutate({
      name: newGalleryName,
      slug,
      order,
    });
  };

  const handleDeleteGallery = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" gallery? This will also delete all photos in this gallery.`)) {
      deleteGalleryMutation.mutate(id);
    }
  };

  const handleEditGallery = (id: string) => {
    const gallery = galleries?.find(g => g.id === id);
    if (gallery) {
      setEditingId(id);
      setEditName(gallery.name);
    }
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    
    const slug = editName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    updateGalleryMutation.mutate({
      id,
      updates: { name: editName.trim(), slug }
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = galleries?.findIndex(g => g.id === active.id) ?? -1;
      const newIndex = galleries?.findIndex(g => g.id === over.id) ?? -1;

      if (oldIndex !== -1 && newIndex !== -1 && galleries) {
        const newOrder = arrayMove(galleries, oldIndex, newIndex);
        const galleryIds = newOrder.map(g => g.id);
        reorderGalleriesMutation.mutate(galleryIds);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-light">Gallery Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create new gallery */}
        <div className="space-y-2">
          <Input
            placeholder="New gallery name"
            value={newGalleryName}
            onChange={(e) => setNewGalleryName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateGallery()}
          />
          <Button
            onClick={handleCreateGallery}
            disabled={!newGalleryName.trim() || createGalleryMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {createGalleryMutation.isPending ? "Creating..." : "Create Gallery"}
          </Button>
        </div>

        {/* Gallery list */}
        <div className="space-y-2">
          <h4 className="font-medium">Existing Galleries</h4>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 animate-pulse rounded"></div>
              ))}
            </div>
          ) : galleries && galleries.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={galleries.map(g => g.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {galleries.map((gallery) => (
                    <SortableGalleryItem
                      key={gallery.id}
                      gallery={gallery}
                      isEditing={editingId === gallery.id}
                      editName={editName}
                      onEdit={handleEditGallery}
                      onSave={handleSaveEdit}
                      onCancel={handleCancelEdit}
                      onDelete={handleDeleteGallery}
                      onEditNameChange={setEditName}
                      disabled={deleteGalleryMutation.isPending || updateGalleryMutation.isPending || reorderGalleriesMutation.isPending}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No galleries found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
