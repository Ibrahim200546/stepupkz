import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MapPin, Phone, Star, ShoppingCart, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";

const VendorStore = () => {
  const { vendorId } = useParams();
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (vendorId) {
      loadVendorData();
    }
  }, [vendorId]);

  const loadVendorData = async () => {
    try {
      setLoading(true);

      // Load vendor info
      const { data: vendorData, error: vendorError } = await (supabase as any)
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single();

      if (vendorError) throw vendorError;
      setVendor(vendorData);

      // Load vendor products
      const { data: productsData, error: productsError } = await (supabase as any)
        .from('vendor_products')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('is_active', true);

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Calculate average rating from product reviews
      if (productsData && productsData.length > 0) {
        const productIds = productsData.map((p: any) => p.id);
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('rating')
          .in('product_id', productIds)
          .eq('is_approved', true);

        if (!reviewsError && reviewsData && reviewsData.length > 0) {
          const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length;
          setAverageRating(Math.round(avg * 10) / 10);
          setTotalReviews(reviewsData.length);
        }
      }
    } catch (error) {
      console.error('Error loading vendor data:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить информацию о магазине",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Магазин не найден</h2>
            <p className="text-muted-foreground mb-4">Возможно, магазин был удален или не существует</p>
            <Button asChild>
              <Link to="/catalog">Перейти в каталог</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title={`${vendor.name} - Магазин на StepUp`}
        description={vendor.description || `Магазин ${vendor.name} на платформе StepUp. Качественная обувь с доставкой по Казахстану.`}
      />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Vendor Header */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24 border-2 border-border">
              <AvatarImage src={vendor.logo} alt={vendor.name} />
              <AvatarFallback className="text-2xl font-bold">
                {vendor.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{vendor.name}</h1>
                  {vendor.verified && (
                    <Badge variant="default" className="mb-2">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Проверенный магазин
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-muted-foreground mb-4">{vendor.description}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                {vendor.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{vendor.address}</span>
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{vendor.phone}</span>
                  </div>
                )}
              </div>

              {totalReviews > 0 && (
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="ml-1 font-semibold">{averageRating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({totalReviews} {totalReviews === 1 ? 'отзыв' : 'отзывов'})
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Separator className="my-8" />

        {/* Products Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            Товары магазина ({products.length})
          </h2>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">В этом магазине пока нет товаров</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="group overflow-hidden hover:shadow-card-hover transition-smooth hover:scale-[1.02]">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={product.images?.[0] || '/placeholder.svg'}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105 animate-in fade-in duration-500"
                      style={{
                        objectFit: 'cover',
                        borderRadius: '12px 12px 0 0',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                        <span className="text-lg font-semibold text-muted-foreground">
                          Нет в наличии
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-foreground">
                        {parseFloat(product.price).toLocaleString('ru-KZ')} ₸
                      </span>
                    </div>

                    {product.stock > 0 && (
                      <Button className="w-full" variant="outline">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        В корзину
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VendorStore;
