import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CategorySection from "@/components/home/CategorySection";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

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
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <HeroSection />
        <CategorySection />
        
        {/* Featured Products Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Популярные товары</h2>
              <p className="text-muted-foreground">Хиты продаж этого месяца</p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex">
              <Link to="/catalog">
                Смотреть все
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild className="w-full">
              <Link to="/catalog">
                Смотреть все товары
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
                <h3 className="font-semibold text-lg">Быстрая доставка</h3>
                <p className="text-muted-foreground text-sm">
                  Доставка по Казахстану за 1-3 дня
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl mb-4">↩️</div>
                <h3 className="font-semibold text-lg">Возврат 30 дней</h3>
                <p className="text-muted-foreground text-sm">
                  Легкий возврат и обмен без вопросов
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl mb-4">💳</div>
                <h3 className="font-semibold text-lg">Оплата онлайн</h3>
                <p className="text-muted-foreground text-sm">
                  Kaspi, карты, рассрочка 0-0-12
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
