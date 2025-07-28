
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Gallery as GalleryType, type Photo } from "@shared/schema";
import { useState, useCallback, useEffect } from "react";

export default function Gallery() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPhoto, setModalPhoto] = useState<Photo | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    if (!modalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);
  const { slug } = useParams();

  const { data: gallery, isLoading: galleryLoading } = useQuery<GalleryType>({
    queryKey: ["/api/galleries", slug],
  });

  const { data: photos, isLoading: photosLoading } = useQuery<Photo[]>({
    queryKey: ["/api/galleries", gallery?.id, "photos"],
    enabled: !!gallery?.id,
  });

  if (galleryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gold mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-light mb-4">Gallery Not Found</h1>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-90 backdrop-blur-md">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:text-gold">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portfolio
              </Button>
            </Link>
            <h1 className="text-2xl font-light tracking-wider">{gallery.name}</h1>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Photo Grid */}
      <div className="pt-24 flex-1 flex flex-col">
        {photosLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gold mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading photos...</p>
            </div>
          </div>
        ) : photos && photos.length > 0 ? (
          <div className="photo-grid bg-black">
            {photos.map((photo) => (
              <img
                key={photo.id}
                src={photo.url}
                alt={photo.originalName}
                className="w-full h-full object-cover cursor-pointer"
                loading="lazy"
                onClick={() => {
                  setModalPhoto(photo);
                  setModalOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <h2 className="text-2xl font-light mb-4">No Photos Yet</h2>
              <p className="text-gray-400">This gallery is empty. Check back soon for new content.</p>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal for Photo */}
      {modalOpen && modalPhoto && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex items-center justify-center" onClick={() => setModalOpen(false)}>
          <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <img
              src={modalPhoto.url}
              alt={modalPhoto.originalName}
              className="max-h-[95vh] max-w-full object-contain mx-auto"
            />
            <button
              className="fixed top-8 right-8 text-white bg-black bg-opacity-60 rounded-full p-2 hover:bg-opacity-90"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              <X className="h-8 w-8" />
            </button>
          </div>
        </div>
      )}

      {/* Scroll to top button */}
      <Button
        className="fixed bottom-8 right-8 rounded-full bg-gold hover:bg-gold-light text-black"
        size="icon"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ChevronDown className="h-4 w-4 rotate-180" />
      </Button>
    </div>
  );
}
