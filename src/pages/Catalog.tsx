import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Catalog = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 100000]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands(name),
          product_images(url)
        `)
        .eq('is_active', true);

      if (error) throw error;

      const formattedProducts = data?.map((product: any) => ({
        id: product.id,
        name: product.name,
        brand: product.brand?.name || '',
        price: parseFloat(product.price),
        oldPrice: product.old_price ? parseFloat(product.old_price) : undefined,
        image: product.product_images[0]?.url || '',
        inStock: true,
      })) || [];

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden md:block w-64 space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Цена</h3>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={100000}
                step={1000}
                className="mb-2"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{priceRange[0].toLocaleString()} ₸</span>
                <span>{priceRange[1].toLocaleString()} ₸</span>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Бренд</h3>
              <div className="space-y-2">
                {['Nike', 'Adidas', 'Puma', 'Reebok'].map(brand => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox id={brand} />
                    <Label htmlFor={brand} className="text-sm cursor-pointer">{brand}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Размер</h3>
              <div className="grid grid-cols-3 gap-2">
                {['38', '39', '40', '41', '42', '43', '44', '45'].map(size => (
                  <Button key={size} variant="outline" size="sm">{size}</Button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Каталог обуви</h1>
              <Select defaultValue="popular">
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Популярные</SelectItem>
                  <SelectItem value="price-asc">Цена: дешевле</SelectItem>
                  <SelectItem value="price-desc">Цена: дороже</SelectItem>
                  <SelectItem value="newest">Новинки</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}

            {!loading && products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">Товары не найдены</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Catalog;
