import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface ProductCardProps {
  id: number;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  image: string;
  inStock: boolean;
}

const ProductCard = ({ id, name, brand, price, oldPrice, image, inStock }: ProductCardProps) => {
  const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  return (
    <Card className="group relative overflow-hidden border bg-card hover:shadow-card-hover transition-smooth">
      <Link to={`/product/${id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img 
            src={image} 
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400';
            }}
          />
          
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground px-2 py-1 rounded-md text-xs font-semibold">
              -{discount}%
            </div>
          )}

          {/* Stock Status */}
          {!inStock && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-lg font-semibold text-muted-foreground">Нет в наличии</span>
            </div>
          )}

          {/* Wishlist Button */}
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute top-3 right-3 bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-smooth"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Add to wishlist
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2">
          <div className="text-sm text-muted-foreground">{brand}</div>
          <h3 className="font-semibold line-clamp-2 min-h-[2.5rem]">{name}</h3>
          
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">
              {price.toLocaleString('ru-KZ')} ₸
            </span>
            {oldPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {oldPrice.toLocaleString('ru-KZ')} ₸
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart Button */}
      {inStock && (
        <div className="p-4 pt-0">
          <Button 
            className="w-full" 
            variant="outline"
            disabled={adding}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              setAdding(true);
              try {
                // Get first available variant for this product
                const { data: variants, error } = await supabase
                  .from('product_variants')
                  .select('id')
                  .eq('product_id', id)
                  .gt('stock', 0) // Get variants with stock > 0
                  .limit(1);

                if (error) throw error;

                if (variants && variants.length > 0) {
                  await addToCart(variants[0].id);
                  toast.success('Товар добавлен в корзину');
                } else {
                  toast.error('Товар временно недоступен');
                }
              } catch (error) {
                console.error('Error adding to cart:', error);
                toast.error('Не удалось добавить в корзину');
              } finally {
                setAdding(false);
              }
            }}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {adding ? 'Добавление...' : 'В корзину'}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ProductCard;
