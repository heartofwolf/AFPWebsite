import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { type Gallery } from "@shared/schema";

export default function GalleryGrid() {
  const { data: galleries, isLoading } = useQuery<Gallery[]>({
    queryKey: ["/api/galleries"],
  });

  // Stock photography URLs for gallery hero images
  const galleryImages = {
    fashion: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800",
    beauty: "https://images.unsplash.com/photo-1487412912498-0447578fcca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800",
    travel: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800",
    portrait: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800",
    conceptual: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
  };

  if (isLoading) {
    return (
      <section id="galleries" className="py-20">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-6xl font-light text-center mb-16 tracking-wider">
            Collections
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 animate-pulse"></div>
            ))}
          </div>
          <div className="mt-0">
            <div className="aspect-[4/1] bg-gray-200 animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  const firstFourGalleries = galleries?.slice(0, 4) || [];
  const conceptualGallery = galleries?.find(g => g.slug === 'conceptual');

  return (
    <section id="galleries" className="py-20">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-6xl font-light text-center mb-16 tracking-wider">
          Collections
        </h2>
        
        {/* First row - 4 galleries */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          {firstFourGalleries.map((gallery) => (
            <Link key={gallery.id} href={`/gallery/${gallery.slug}`}>
              <div className="gallery-card aspect-square cursor-pointer">
                <img
                  src={gallery.heroImage || galleryImages[gallery.slug as keyof typeof galleryImages] || galleryImages.fashion}
                  alt={`${gallery.name} Photography`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <h3 className="text-white text-2xl md:text-3xl font-light tracking-wider opacity-0 hover:opacity-100 transition-opacity duration-300">
                    {gallery.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Second row - Conceptual gallery (full width) */}
        {conceptualGallery && (
          <div className="mt-0">
            <Link href={`/gallery/${conceptualGallery.slug}`}>
              <div className="gallery-card aspect-[4/1] cursor-pointer">
                <img
                  src={conceptualGallery.heroImage || galleryImages.conceptual}
                  alt="Conceptual Photography"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <h3 className="text-white text-3xl md:text-5xl font-light tracking-wider opacity-0 hover:opacity-100 transition-opacity duration-300">
                    {conceptualGallery.name}
                  </h3>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
