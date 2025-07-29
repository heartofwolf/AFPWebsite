import { Button } from "@/components/ui/button";

export default function AboutSection() {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-light text-center mb-16 tracking-wider">
            About Me
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <img
                src="/Uploads/me.jpg"
                alt="Adam Fedorowicz Photography"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
            <div className="animate-slide-up space-y-6">
              <p className="text-lg leading-relaxed text-gray-700">
                My journey into photography began over two decades ago, starting with a simple 
                curiosity about capturing light and emotion. What began as a hobby quickly 
                evolved into a passionate pursuit of visual storytelling.
              </p>
              <p className="text-lg leading-relaxed text-gray-700">
                Specializing in fashion, beauty, and conceptual photography, I strive to 
                create images that not only capture a moment but evoke emotion and tell a 
                story. Each session is a collaboration, where technical expertise meets 
                creative vision.
              </p>

              <div className="pt-6">

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
