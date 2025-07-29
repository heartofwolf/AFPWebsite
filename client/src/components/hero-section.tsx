
import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function HeroSection() {
  const scrollToGalleries = () => {
    const element = document.getElementById('galleries');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch homepage photo from admin settings
  const { data: homepageData } = useQuery<{ photoUrl: string | null }>({
    queryKey: ["/api/admin/homepage-photo"],
  });
  const heroImage = homepageData?.photoUrl;

  return (
    <section className="hero-section relative w-full h-screen overflow-hidden">
      {heroImage && (
        <img
          src={heroImage}
          alt="Portfolio Hero"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white  bg-black bg-opacity-40">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight opacity-60">
          ADAM FEDOROWICZ
        </h1>
        <p className="text-xl md:text-3xl font-light tracking-tight opacity-60">
          PHOTOGRAPHY
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
