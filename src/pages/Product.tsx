import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart, Heart, Loader2, Star } from "lucide-react";
import { toast } from "sonner";

const Product = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands(name),
          product_images(url, alt),
          product_variants(id, size, color, stock)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);
      
      // Select first variant by default
      if (data?.product_variants?.length > 0) {
        setSelectedVariant(data.product_variants[0].id);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Ошибка загрузки товара');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Выберите размер');
      return;
    }
    await addToCart(selectedVariant);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Товар не найден</h2>
            <Button asChild>
              <Link to="/catalog">Вернуться в каталог</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const discount = product.old_price 
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100) 
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img 
                src={product.product_images[0]?.url || '/placeholder.svg'} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.product_images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.product_images.slice(1, 5).map((img: any, idx: number) => (
                  <div key={idx} className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition">
                    <img src={img.url} alt={img.alt || product.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-2">{product.brand?.name}</p>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">(45 отзывов)</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold">{product.price.toLocaleString('ru-KZ')} ₸</span>
                {product.old_price && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">
                      {product.old_price.toLocaleString('ru-KZ')} ₸
                    </span>
                    <Badge variant="destructive">-{discount}%</Badge>
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Выберите размер:</h3>
              <div className="grid grid-cols-4 gap-2">
                {product.product_variants?.map((variant: any) => (
                  <Button
                    key={variant.id}
                    variant={selectedVariant === variant.id ? "default" : "outline"}
                    onClick={() => setSelectedVariant(variant.id)}
                    disabled={variant.stock === 0}
                  >
                    {variant.size}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                size="lg" 
                className="flex-1" 
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                В корзину
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Описание</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="border-t pt-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Артикул:</span>
                <span className="font-medium">{product.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Наличие:</span>
                <span className="font-medium text-green-600">В наличии</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Product;
