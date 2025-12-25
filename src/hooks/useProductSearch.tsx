import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  old_price?: number;
  sku: string;
  brand_id: string;
  brand_name: string;
  category_id: string;
  category_name: string;
  image_url: string;
  is_featured: boolean;
  rank: number;
}

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  brandIds?: string[];
  categoryIds?: string[];
}

export interface UseProductSearchOptions {
  debounceMs?: number;
  limit?: number;
  enabled?: boolean;
}

export const useProductSearch = (
  query: string,
  filters: SearchFilters = {},
  options: UseProductSearchOptions = {}
) => {
  const {
    debounceMs = 400,
    limit = 20,
    enabled = true,
  } = options;

  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const searchProducts = useCallback(async (
    searchQuery: string,
    searchFilters: SearchFilters,
    offset: number = 0
  ) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('search_products', {
        search_query: searchQuery.trim(),
        min_price: searchFilters.minPrice ?? 0,
        max_price: searchFilters.maxPrice ?? 999999999,
        brand_ids: searchFilters.brandIds?.length ? searchFilters.brandIds : null,
        category_ids: searchFilters.categoryIds?.length ? searchFilters.categoryIds : null,
        limit_count: limit,
        offset_count: offset,
      });

      if (rpcError) throw rpcError;

      setResults(data || []);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Search error:', err);
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (!enabled) {
      setResults([]);
      return;
    }

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the search
    debounceTimerRef.current = setTimeout(() => {
      searchProducts(query, filters);
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    query, 
    debounceMs, 
    enabled,
    filters.minPrice,
    filters.maxPrice,
    filters.brandIds?.join(','),
    filters.categoryIds?.join(','),
  ]);

  const refetch = useCallback(() => {
    searchProducts(query, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filters.minPrice, filters.maxPrice, filters.brandIds, filters.categoryIds]);

  return {
    results,
    loading,
    error,
    refetch,
  };
};
