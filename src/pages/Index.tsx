import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

// Mock data for featured products
const featuredProducts = [
  {
    id: 1,
    name: "Кроссовки комфорт кожа",
    brand: "ComfortWalk",
    price: 29990,
    oldPrice: 39990,
    image: product1,
    inStock: true,
  },
  {
    id: 2,
    name: "Беговые кроссовки Pro",
    brand: "SportMax",
    price: 34990,
    image: product2,
    inStock: true,
  },
  {
    id: 3,
    name: "Классические туфли",
    brand: "Elegance",
    price: 45990,
    oldPrice: 59990,
    image: product3,
    inStock: true,
  },
  {
    id: 4,
    name: "Летние сандалии",
    brand: "SummerStyle",
    price: 19990,
    image: product4,
    inStock: true,
  },
];

const Index = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <HeroSection />
        <CategorySection />
        
        {/* Featured Products Section */}
        <section className="container mx-auto px-4 py-8 sm:py-16 overflow-x-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">{t('home.featured')}</h2>
              <p className="text-muted-foreground">{t('home.featuredDesc')}</p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link to="/catalog">
                {t('home.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link to="/catalog">
                {t('home.viewAllProducts')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-2">
                <div className="text-4xl mb-4">🚚</div>
                <h3 className="font-semibold text-lg">{t('home.fastDelivery')}</h3>
                <p className="text-muted-foreground text-sm">
                  {t('home.fastDeliveryDesc')}
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl mb-4">↩️</div>
                <h3 className="font-semibold text-lg">{t('home.return30')}</h3>
                <p className="text-muted-foreground text-sm">
                  {t('home.return30Desc')}
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl mb-4">💳</div>
                <h3 className="font-semibold text-lg">{t('home.onlinePayment')}</h3>
                <p className="text-muted-foreground text-sm">
                  {t('home.onlinePaymentDesc')}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
