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
import { useTranslation } from "react-i18next";
import type { Product as ProductType } from "@/types/database";

interface ProductWithDetails extends ProductType {
  brand?: { name: string };
  product_images: Array<{ url: string; alt?: string }>;
  product_variants: Array<{ id: string; size?: string; color?: string; stock?: number }>;
}

const Product = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<ProductWithDetails | null>(null);
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
      toast.error(t('product.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error(t('product.selectSize'));
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
            <h2 className="text-2xl font-bold mb-4">{t('product.notFound')}</h2>
            <Button asChild>
              <Link to="/catalog">{t('product.backToCatalog')}</Link>
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
      
      <main className="flex-1 container mx-auto px-4 py-8 overflow-x-hidden">
        <div className="grid md:grid-cols-2 gap-6 md:gap-12">
          {/* Images */}
          <div className="space-y-3 sm:space-y-4">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden max-w-full">
              <img 
                src={product.product_images[0]?.url || '/placeholder.svg'} 
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-contain sm:object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-shoe.svg';
                }}
              />
            </div>
            {product.product_images.length > 1 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4">
                {product.product_images.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition">
                    <img 
                      src={img.url} 
                      alt={img.alt || product.name} 
                      loading="lazy"
                      className="w-full h-full object-contain sm:object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-shoe.svg';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <p className="text-sm sm:text-base text-muted-foreground mb-2">{product.brand?.name}</p>
              <h1 className="text-2xl sm:text-3xl font-bold mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">(45 {t('product.reviews')})</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <span className="text-2xl sm:text-3xl font-bold">{product.price.toLocaleString('ru-KZ')} ₸</span>
                {product.old_price && (
                  <>
                    <span className="text-lg sm:text-xl text-muted-foreground line-through">
                      {product.old_price.toLocaleString('ru-KZ')} ₸
                    </span>
                    <Badge variant="destructive" className="text-xs sm:text-sm">-{discount}%</Badge>
                  </>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm sm:text-base mb-3">{t('product.selectSize')}:</h3>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 gap-2">
                {product.product_variants?.map((variant) => (
                  <Button
                    key={variant.id}
                    variant={selectedVariant === variant.id ? "default" : "outline"}
                    onClick={() => setSelectedVariant(variant.id)}
                    disabled={variant.stock === 0}
                    className="text-xs sm:text-sm"
                  >
                    {variant.size}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 sm:gap-4">
              <Button 
                size="lg" 
                className="flex-1 text-sm sm:text-base" 
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                {t('product.addToCart')}
              </Button>
              <Button size="lg" variant="outline" className="px-3 sm:px-4">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">{t('product.description')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="border-t pt-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">SKU:</span>
                <span className="font-medium">{product.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('product.inStock')}:</span>
                <span className="font-medium text-green-600">{t('product.inStock')}</span>
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
