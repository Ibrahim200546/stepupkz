import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  product_variant_id: string;
  quantity: number;
  product?: {
    name: string;
    price: number;
    image: string;
  };
  variant?: {
    size: string;
    color: string;
  };
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  loading: boolean;
  addToCart: (productVariantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cartId, setCartId] = useState<string | null>(null);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  // Get or create cart
  useEffect(() => {
    if (user) {
      getOrCreateCart();
    } else {
      setCartItems([]);
      setCartId(null);
    }
  }, [user]);

  const getOrCreateCart = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Try to get existing cart
      let { data: cart, error } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Create cart if it doesn't exist
      if (!cart) {
        const { data: newCart, error: createError } = await supabase
          .from('carts')
          .insert({ user_id: user.id })
          .select('id')
          .single();

        if (createError) throw createError;
        cart = newCart;
      }

      setCartId(cart.id);
      await loadCartItems(cart.id);
    } catch (error: any) {
      console.error('Error getting cart:', error);
      toast.error('Ошибка загрузки корзины');
    } finally {
      setLoading(false);
    }
  };

  const loadCartItems = async (cartId: string) => {
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_variant_id,
          quantity,
          product_variants (
            size,
            color,
            products (
              name,
              price,
              product_images (url)
            )
          )
        `)
        .eq('cart_id', cartId);

      if (error) throw error;

      const items = data.map((item: any) => ({
        id: item.id,
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        product: {
          name: item.product_variants.products.name,
          price: item.product_variants.products.price,
          image: item.product_variants.products.product_images[0]?.url || '',
        },
        variant: {
          size: item.product_variants.size,
          color: item.product_variants.color,
        },
      }));

      setCartItems(items);
    } catch (error: any) {
      console.error('Error loading cart items:', error);
    }
  };

  const addToCart = async (productVariantId: string, quantity: number = 1) => {
    if (!user || !cartId) {
      toast.error('Войдите в систему для добавления в корзину');
      return;
    }

    try {
      // Check if item already in cart
      const existingItem = cartItems.find(item => item.product_variant_id === productVariantId);

      if (existingItem) {
        await updateQuantity(existingItem.id, existingItem.quantity + quantity);
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cartId,
            product_variant_id: productVariantId,
            quantity,
          });

        if (error) throw error;
        
        await loadCartItems(cartId);
        toast.success('Товар добавлен в корзину');
      }
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast.error('Ошибка добавления в корзину');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;

      setCartItems(prev => 
        prev.map(item => item.id === itemId ? { ...item, quantity } : item)
      );
    } catch (error: any) {
      console.error('Error updating quantity:', error);
      toast.error('Ошибка обновления количества');
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setCartItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Товар удален из корзины');
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      toast.error('Ошибка удаления из корзины');
    }
  };

  const clearCart = async () => {
    if (!cartId) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);

      if (error) throw error;

      setCartItems([]);
      toast.success('Корзина очищена');
    } catch (error: any) {
      console.error('Error clearing cart:', error);
      toast.error('Ошибка очистки корзины');
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
