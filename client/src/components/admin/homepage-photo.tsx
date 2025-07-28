import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function HomepagePhotoManagement() {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: homepageData } = useQuery<{ photoUrl: string | null }>({
    queryKey: ["/api/admin/homepage-photo"],
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await fetch("/api/admin/homepage-photo", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/homepage-photo"] });
      toast({
        title: "Homepage photo updated",
        description: "The homepage background photo has been updated successfully",
      });
      setUploading(false);
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload homepage photo",
        variant: "destructive",
      });
      setUploading(false);
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      uploadPhotoMutation.mutate(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-light">Homepage Background</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current homepage photo */}
        {homepageData?.photoUrl ? (
          <div className="space-y-2">
            <h4 className="font-medium">Current Background Photo</h4>
            <div className="relative aspect-video max-w-sm bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={homepageData.photoUrl}
                alt="Homepage background"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No homepage background photo set</p>
            </div>
          </div>
        )}

        {/* Upload new photo */}
        <div className="space-y-2">
          <h4 className="font-medium">Upload New Background Photo</h4>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={handleUploadClick}
            disabled={uploading || uploadPhotoMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading || uploadPhotoMutation.isPending ? "Uploading..." : "Upload New Photo"}
          </Button>
          <p className="text-sm text-gray-500">
            Recommended: High-resolution landscape photo (1920x1080 or larger)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}