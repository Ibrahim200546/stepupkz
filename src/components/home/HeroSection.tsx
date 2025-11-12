import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-shoes.jpg";

const HeroSection = () => {
  return (
    <section className="relative w-full bg-gradient-hero overflow-hidden">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Text Content */}
          <div className="text-white space-y-6 z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Новая коллекция
              <br />
              <span className="text-secondary">сезона 2025</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-lg">
              Откройте для себя идеальную обувь для любого случая. Качество, комфорт и стиль в каждой паре.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" variant="hero" asChild>
                <Link to="/catalog">
                  Смотреть каталог
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm">
                <Link to="/catalog?sale=true">
                  Распродажа до -50%
                </Link>
              </Button>
            </div>
            <div className="flex gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold">5000+</div>
                <div className="text-white/80 text-sm">моделей</div>
              </div>
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-white/80 text-sm">брендов</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50K+</div>
                <div className="text-white/80 text-sm">клиентов</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <img 
              src={heroImage} 
              alt="Новая коллекция обуви"
              loading="eager"
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-secondary/10 blur-3xl"></div>
    </section>
  );
};

export default HeroSection;
