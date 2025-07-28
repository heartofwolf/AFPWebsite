import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { type Gallery } from "@shared/schema";

export default function GalleryGrid() {
  const { data: galleries, isLoading } = useQuery<Gallery[]>({
    queryKey: ["/api/galleries"],
  });

  // Default image if gallery has no heroImage
  const defaultImage = "https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800";

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


  // Split galleries into rows of 3
  const galleryRows: Gallery[][] = [];
  if (galleries && galleries.length > 0) {
    for (let i = 0; i < galleries.length; i += 3) {
      galleryRows.push(galleries.slice(i, i + 3));
    }
  }

  return (
    <section id="galleries" className="py-20">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-6xl font-light text-center mb-16 tracking-wider">
          Gallery
        </h2>
        {galleryRows.map((row, rowIdx) => {
          const colCount = row.length;
          // Use flex to ensure all items have the same height, and fill empty columns with invisible placeholders
          return (
            <div key={rowIdx} className="flex gap-0">
              {row.map((gallery) => (
                <Link key={gallery.id} href={`/gallery/${gallery.slug}`} className="flex-1">
                  <div className="gallery-card cursor-pointer group relative hover:z-20">
                    <img
                      src={gallery.heroImage || defaultImage}
                      alt={`${gallery.name} Photography`}
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center z-10 group-hover:bg-neutral-800 group-hover:bg-opacity-50 transition-colors duration-300">
                      <h3 className="text-white text-2xl md:text-3xl font-light tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {gallery.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
              {/* Fill remaining columns with invisible placeholders to maintain layout */}
              {Array.from({ length: 3 - colCount }).map((_, idx) => (
                <div key={idx} className="flex-1 invisible" />
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
