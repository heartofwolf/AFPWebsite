import { Instagram, Facebook, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex space-x-6">
            <a 
              href="#" 
              className="text-white hover:text-gold text-2xl transition-colors"
              aria-label="Instagram"
            >
              <Instagram />
            </a>
            <a 
              href="#" 
              className="text-white hover:text-gold text-2xl transition-colors"
              aria-label="Facebook"
            >
              <Facebook />
            </a>
            <a 
              href="#" 
              className="text-white hover:text-gold text-2xl transition-colors"
              aria-label="Twitter"
            >
              <Twitter />
            </a>
            <a 
              href="#" 
              className="text-white hover:text-gold text-2xl transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin />
            </a>
          </div>
          <div className="text-white text-center">
            <p>&copy; 2024 Adam Fedorowicz Photography. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
