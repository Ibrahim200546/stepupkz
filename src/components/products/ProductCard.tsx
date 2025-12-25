import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart } from 'lucide-react';
import { ResponsiveImage } from '@/components/ui/responsive-image';

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  image: string;
  inStock?: boolean;
}

const ProductCard = ({
  id,
  name,
  brand,
  price,
  oldPrice,
  image,
  inStock = true,
}: ProductCardProps) => {
  const discount = oldPrice
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 w-full max-w-full">
      <Link to={`/product/${id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted w-full">
          <ResponsiveImage
            src={image}
            alt={name}
            className="group-hover:scale-105 transition-transform duration-300 w-full h-full"
          />
          
          {discount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 left-2 z-10"
            >
              -{discount}%
            </Badge>
          )}

          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary">Нет в наличии</Badge>
            </div>
          )}

          {/* Quick actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Add to wishlist
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">
            {brand}
          </p>
          <h3 className="font-semibold text-sm sm:text-base mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
            {name}
          </h3>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold">
                {price.toLocaleString('ru-KZ')} ₸
              </span>
              {oldPrice && (
                <span className="text-xs sm:text-sm text-muted-foreground line-through">
                  {oldPrice.toLocaleString('ru-KZ')} ₸
                </span>
              )}
            </div>

            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-full flex-shrink-0"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Add to cart
              }}
              disabled={!inStock}
            >
              <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default ProductCard;
