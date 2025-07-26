import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Message sent!",
      description: "Thank you for your inquiry. I'll get back to you soon.",
    });

    setFormData({ name: "", email: "", projectType: "", message: "" });
    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-light text-center mb-16 tracking-wider">
            Contact
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-light mb-4 tracking-wide">Get in Touch</h3>
                <p className="text-gray-600 leading-relaxed">
                  Ready to create something extraordinary together? I'd love to hear about 
                  your project and discuss how we can bring your vision to life.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Mail className="text-gold text-xl" />
                  <span>adam@fedorowiczphotography.com</span>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone className="text-gold text-xl" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-4">
                  <MapPin className="text-gold text-xl" />
                  <span>New York, NY / Los Angeles, CA</span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className="focus:border-gold"
              />
              
              <Input
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="focus:border-gold"
              />
              
              <Select 
                value={formData.projectType} 
                onValueChange={(value) => handleInputChange("projectType", value)}
              >
                <SelectTrigger className="focus:border-gold">
                  <SelectValue placeholder="Project Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fashion">Fashion Shoot</SelectItem>
                  <SelectItem value="beauty">Beauty Photography</SelectItem>
                  <SelectItem value="portrait">Portrait Session</SelectItem>
                  <SelectItem value="commercial">Commercial Work</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              
              <Textarea
                placeholder="Tell me about your project..."
                rows={5}
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                required
                className="focus:border-gold"
              />
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white hover:bg-gold transition-colors duration-300 tracking-wide"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
