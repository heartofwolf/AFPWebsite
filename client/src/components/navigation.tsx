import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { type Gallery } from "@shared/schema";

interface NavigationProps {
  isScrolled: boolean;
}

export default function Navigation({ isScrolled }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: galleries } = useQuery<Gallery[]>({
    queryKey: ["/api/galleries"],
  });

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Main Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'opacity-0 invisible' : 'opacity-100 visible'
        }`}
      >
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="text-2xl font-light text-white tracking-wider cursor-pointer">
                Adam Fedorowicz
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-8">
              <div 
                className="relative"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                <button className="nav-link text-white hover:text-gold font-light tracking-wide pb-1">
                  Gallery
                </button>
                {showDropdown && galleries && (
                  <div className="absolute top-full left-0 mt-1 bg-black bg-opacity-90 backdrop-blur-md rounded-lg p-4 min-w-[200px] opacity-100 visible transform translate-y-0 transition-all duration-300">
                    {galleries.map((gallery) => (
                      <Link key={gallery.id} href={`/gallery/${gallery.slug}`}>
                        <div className="block text-white hover:text-gold py-2 transition-colors cursor-pointer">
                          {gallery.name}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => scrollToSection('about')}
                className="nav-link text-white hover:text-gold font-light tracking-wide"
              >
                About Me
              </button>
              
              <button 
                onClick={() => scrollToSection('contact')}
                className="nav-link text-white hover:text-gold font-light tracking-wide"
              >
                Contact
              </button>
              
              <Link href="/admin">
                <button className="text-xs text-white hover:text-gold opacity-50 transition-all">
                  Admin
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hamburger Menu Button */}
      <Button
        className="fixed top-5 right-5 z-[1000] bg-white bg-opacity-20 backdrop-blur-md rounded-full p-3 text-white hover:text-gold transition-all duration-300 md:hidden"
        size="icon"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <Button
          className="absolute top-6 right-6 text-white hover:text-gold text-2xl bg-transparent border-none p-0"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X className="h-8 w-8" />
        </Button>
        
        <div className="space-y-6">
          <div className="text-xl font-light text-white mb-8">Gallery</div>
          {galleries?.map((gallery) => (
            <Link key={gallery.id} href={`/gallery/${gallery.slug}`}>
              <div 
                className="block text-white hover:text-gold py-2 pl-4 transition-colors cursor-pointer"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {gallery.name}
              </div>
            </Link>
          ))}
          
          <button 
            onClick={() => scrollToSection('about')}
            className="block text-white hover:text-gold py-2 text-xl font-light mt-8 w-full text-left"
          >
            About Me
          </button>
          
          <button 
            onClick={() => scrollToSection('contact')}
            className="block text-white hover:text-gold py-2 text-xl font-light w-full text-left"
          >
            Contact
          </button>
        </div>
      </div>
    </>
  );
}
