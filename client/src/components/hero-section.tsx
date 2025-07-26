import { ChevronDown } from "lucide-react";

export default function HeroSection() {
  const scrollToGalleries = () => {
    const element = document.getElementById('galleries');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section h-screen flex items-center justify-center relative">
      <div className="text-center text-white animate-fade-in">
        <h1 className="text-6xl md:text-8xl font-light mb-6 tracking-wider">
          Photography
        </h1>
        <p className="text-xl md:text-2xl font-light tracking-wide opacity-90">
          Capturing moments that tell stories
        </p>
      </div>
      
      <button 
        onClick={scrollToGalleries}
        className="scroll-indicator cursor-pointer hover:text-gold transition-colors"
      >
        <ChevronDown className="h-8 w-8 text-white opacity-70" />
      </button>
    </section>
  );
}
