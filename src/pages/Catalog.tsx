import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types/database";

interface CatalogProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  image: string;
  inStock: boolean;
}

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const productsPerPage = 12;

  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
  }, [searchQuery]);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('name')
        .order('name');

      if (error) throw error;
      setAvailableBrands(data?.map(b => b.name) || []);
    } catch (error) {
      console.error('Error loading brands:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);

      // Use RPC function for search if query exists
      if (searchQuery.trim()) {
        const { data, error } = await supabase.rpc('search_products', {
          search_query: searchQuery.trim(),
          min_price: 0,
          max_price: 999999999,
          brand_ids: null,
          category_ids: null,
          limit_count: 100,
          offset_count: 0,
        });

        if (error) throw error;

        const formattedProducts = data?.map((product: any) => ({
          id: product.id,
          name: product.name,
          brand: product.brand_name || '',
          price: parseFloat(product.price),
          oldPrice: product.old_price ? parseFloat(product.old_price) : undefined,
          image: product.image_url || '',
          inStock: true,
        })) || [];

        setProducts(formattedProducts);
      } else {
        // Regular query without search
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            brand:brands(name),
            product_images(url)
          `)
          .eq('is_active', true);

        if (error) throw error;

        const formattedProducts = data?.map((product) => ({
          id: product.id,
          name: product.name,
          brand: product.brand?.name || '',
          price: parseFloat(product.price),
          oldPrice: product.old_price ? parseFloat(product.old_price) : undefined,
          image: product.product_images[0]?.url || '',
          inStock: true,
        })) || [];

        setProducts(formattedProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация и сортировка
  const filteredProducts = products
    .filter(product => {
      // Фильтр по цене
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      // Фильтр по бренду
      if (selectedBrands.length > 0) {
        // Check if product has a brand and it matches selected brands
        if (!product.brand || !selectedBrands.includes(product.brand)) {
          return false;
        }
      }

      // Фильтр по размеру (примечание: у продуктов нет размера в данной модели)
      // Если бы был размер, проверяли бы здесь
      
      return true;
    })
    .sort((a, b) => {
      // Сортировка
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return 0; // Можно добавить сортировку по дате
        case 'popular':
        default:
          return 0;
      }
    });

  // Обработчики фильтров
  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand]);
    } else {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    }
    setCurrentPage(1); // Сброс на первую страницу
  };

  const handleSizeToggle = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
    setCurrentPage(1); // Сброс на первую страницу
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    setCurrentPage(1); // Сброс на первую страницу
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 overflow-x-hidden">
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Filters Sidebar */}
          <aside className="hidden md:block md:w-64 space-y-6 flex-shrink-0">
            <div>
              <h3 className="font-semibold mb-4">Цена</h3>
              <Slider
                value={priceRange}
                onValueChange={handlePriceChange}
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
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableBrands.map(brand => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox 
                      id={brand}
                      checked={selectedBrands.includes(brand)}
                      onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
                    />
                    <Label htmlFor={brand} className="text-sm cursor-pointer">{brand}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Размер</h3>
              <div className="grid grid-cols-3 gap-2">
                {['38', '39', '40', '41', '42', '43', '44', '45'].map(size => (
                  <Button 
                    key={size} 
                    variant={selectedSizes.includes(size) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSizeToggle(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">Каталог обуви</h1>
                {searchQuery && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">
                      Поиск: "{searchQuery}"
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchParams({});
                      }}
                      className="h-6 px-2"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[200px]">
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
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredProducts
                    .slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage)
                    .map((product) => (
                      <ProductCard key={product.id} {...product} />
                    ))}
                </div>

                {/* Pagination */}
                {filteredProducts.length > productsPerPage && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Назад
                    </Button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-10"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredProducts.length / productsPerPage), p + 1))}
                      disabled={currentPage === Math.ceil(filteredProducts.length / productsPerPage)}
                    >
                      Дальше
                    </Button>
                  </div>
                )}
              </>
            )}

            {!loading && filteredProducts.length === 0 && (
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
