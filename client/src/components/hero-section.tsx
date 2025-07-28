
import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type Gallery } from "@shared/schema";

export default function HeroSection() {
  const scrollToGalleries = () => {
    const element = document.getElementById('galleries');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch galleries and find the 'Nude' gallery
  const { data: galleries } = useQuery<Gallery[]>({ queryKey: ["/api/galleries"] });
  const nudeGallery = galleries?.find((g: Gallery) => g.slug === 'nude');
  const heroImage = nudeGallery?.heroImage;

  return (
    <section className="hero-section relative w-full h-screen overflow-hidden">
      {heroImage && (
        <img
          src={heroImage}
          alt="Nude Gallery Hero"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white animate-fade-in z-10 bg-black bg-opacity-40">
        <h1 className="text-6xl md:text-8xl font-light mb-6 tracking-wider">
          Photography
        </h1>
        <p className="text-xl md:text-2xl font-light tracking-wide opacity-90">
          Capturing moments that tell stories
        </p>
      </div>
      <button 
        onClick={scrollToGalleries}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-indicator cursor-pointer hover:text-gold transition-colors z-20"
      >
        <ChevronDown className="h-8 w-8 text-white opacity-70" />
      </button>
    </section>
  );
}
