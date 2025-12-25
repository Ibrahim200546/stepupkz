import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search as SearchIcon } from 'lucide-react';
import type { SearchProduct } from '@/hooks/useProductSearch';

interface SearchResultsProps {
  results: SearchProduct[];
  loading: boolean;
  query: string;
  onClose?: () => void;
}

export const SearchResults = ({ results, loading, query, onClose }: SearchResultsProps) => {
  if (loading) {
    return (
      <Card className="absolute top-full left-0 right-0 mt-2 p-6 shadow-lg z-50">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Поиск...</span>
        </div>
      </Card>
    );
  }

  if (!query.trim()) {
    return null;
  }

  if (results.length === 0) {
    return (
      <Card className="absolute top-full left-0 right-0 mt-2 p-6 shadow-lg z-50">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <SearchIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Ничего не найдено по запросу "<span className="font-semibold">{query}</span>"
          </p>
          <p className="text-xs text-muted-foreground">
            Попробуйте изменить запрос или проверьте правильность написания
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="absolute top-full left-0 right-0 mt-2 max-h-[400px] sm:max-h-[500px] overflow-y-auto shadow-lg z-50">
      <div className="p-2">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <span className="text-sm font-semibold">
            Найдено товаров: {results.length}
          </span>
          {results.length >= 20 && (
            <Link
              to={`/catalog?search=${encodeURIComponent(query)}`}
              onClick={onClose}
              className="text-xs text-primary hover:underline"
            >
              Показать все
            </Link>
          )}
        </div>

        <div className="divide-y">
          {results.map((product) => {
            const discount = product.old_price
              ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
              : 0;

            return (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                onClick={onClose}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-muted transition-colors"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 bg-muted rounded overflow-hidden">
                  <img
                    src={product.image_url || '/placeholder-shoe.svg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-shoe.svg';
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {product.brand_name}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {product.price.toLocaleString('ru-KZ')} ₸
                        </span>
                        {discount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            -{discount}%
                          </Badge>
                        )}
                      </div>
                      {product.old_price && (
                        <span className="text-xs text-muted-foreground line-through">
                          {product.old_price.toLocaleString('ru-KZ')} ₸
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {product.category_name}
                    </Badge>
                    {product.is_featured && (
                      <Badge className="text-xs">Популярное</Badge>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
