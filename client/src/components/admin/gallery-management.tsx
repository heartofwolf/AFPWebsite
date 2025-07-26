import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Gallery } from "@shared/schema";

export default function GalleryManagement() {
  const [newGalleryName, setNewGalleryName] = useState("");
  const { toast } = useToast();

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
              {galleries.map((gallery) => (
                <div
                  key={gallery.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                >
                  <div className="flex items-center space-x-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{gallery.name}</div>
                      <div className="text-sm text-gray-500">/{gallery.slug}</div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteGallery(gallery.id, gallery.name)}
                    disabled={deleteGalleryMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No galleries found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
