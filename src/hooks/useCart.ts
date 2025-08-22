
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  qty: number;
  unit_price_inr: number;
  subtotal_inr: number;
  product: {
    title: string;
    description: string | null;
    images: string[];
    stock: number;
  };
}

export interface Cart {
  id: string;
  user_id: string;
  status: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export const useCart = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCart = async () => {
    if (!user) return;

    try {
      // Get or create cart
      const { data: cartId, error: cartError } = await supabase
        .rpc('get_or_create_cart', { p_user_id: user.id });

      if (cartError) throw cartError;

      // Fetch cart with items
      const { data: cartData, error: fetchError } = await supabase
        .from('carts')
        .select(`
          *,
          cart_items (
            *,
            products (
              title,
              description,
              images,
              stock
            )
          )
        `)
        .eq('id', cartId)
        .single();

      if (fetchError) throw fetchError;

      const cartItems: CartItem[] = cartData.cart_items.map((item: any) => ({
        ...item,
        product: item.products
      }));

      const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal_inr, 0);
      const itemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

      setCart({
        ...cartData,
        items: cartItems,
        subtotal,
        itemCount
      });
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      toast({
        title: "Error loading cart",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, qty: number = 1) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Get product details
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('price_inr, stock')
        .eq('id', productId)
        .single();

      if (productError) throw productError;

      if (product.stock < qty) {
        throw new Error('Insufficient stock');
      }

      // Get or create cart
      const { data: cartId, error: cartError } = await supabase
        .rpc('get_or_create_cart', { p_user_id: user.id });

      if (cartError) throw cartError;

      // Check if item already exists in cart
      const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId)
        .eq('product_id', productId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingItem) {
        // Update existing item
        const newQty = existingItem.qty + qty;
        const newSubtotal = newQty * product.price_inr;

        const { error: updateError } = await supabase
          .from('cart_items')
          .update({
            qty: newQty,
            subtotal_inr: newSubtotal,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Create new item
        const subtotal = qty * product.price_inr;

        const { error: insertError } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cartId,
            product_id: productId,
            qty,
            unit_price_inr: product.price_inr,
            subtotal_inr: subtotal
          });

        if (insertError) throw insertError;
      }

      await fetchCart();
      
      toast({
        title: "Added to cart",
        description: "Item successfully added to your cart",
      });
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error adding to cart",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateCartItem = async (itemId: string, qty: number) => {
    if (!user) throw new Error('User not authenticated');

    try {
      if (qty <= 0) {
        await removeFromCart(itemId);
        return;
      }

      // Get item details
      const { data: item, error: itemError } = await supabase
        .from('cart_items')
        .select('unit_price_inr')
        .eq('id', itemId)
        .single();

      if (itemError) throw itemError;

      const newSubtotal = qty * item.unit_price_inr;

      const { error: updateError } = await supabase
        .from('cart_items')
        .update({
          qty,
          subtotal_inr: newSubtotal,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (updateError) throw updateError;

      await fetchCart();
    } catch (error: any) {
      console.error('Error updating cart item:', error);
      toast({
        title: "Error updating cart",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      await fetchCart();
      
      toast({
        title: "Removed from cart",
        description: "Item successfully removed from your cart",
      });
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error removing from cart",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  return {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    refetchCart: fetchCart
  };
};
