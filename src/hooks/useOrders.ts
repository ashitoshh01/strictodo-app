
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Order {
  id: string;
  user_id: string;
  items_json: any;
  subtotal_inr: number;
  discount_due_coins: number;
  tax_inr: number;
  shipping_inr: number;
  total_payable_inr: number;
  payment_status: 'pending' | 'paid' | 'failed';
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error fetching orders",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (cartItems: any[], coinsToUse: number = 0) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal_inr, 0);
      
      // Get user's current balance
      const userBalance = user ? (await supabase
        .from('profiles')
        .select('due_coins')
        .eq('id', user.id)
        .single()).data?.due_coins || 0 : 0;

      // Calculate coin usage
      const { data: coinCalc, error: calcError } = await supabase
        .rpc('calculate_due_coins_usage', {
          p_subtotal_inr: subtotal,
          p_user_balance: userBalance,
          p_requested_coins: coinsToUse
        });

      if (calcError) throw calcError;

      const coinData = coinCalc as any;
      const tax = Math.floor(subtotal * 0.18); // 18% GST
      const shipping = subtotal > 50000 ? 0 : 5000; // Free shipping above ₹500
      const totalPayable = coinData.payable_before_tax_shipping_inr + tax + shipping;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          items_json: cartItems,
          subtotal_inr: subtotal,
          discount_due_coins: coinData.coins_used,
          tax_inr: tax,
          shipping_inr: shipping,
          total_payable_inr: totalPayable,
          payment_status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      return order;
    } catch (error: any) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'paid' | 'failed', paymentReference?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: status,
          payment_reference: paymentReference,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', user.id);

      if (error) throw error;

      // If payment successful, deduct coins and add to ledger
      if (status === 'paid') {
        const { data: order } = await supabase
          .from('orders')
          .select('discount_due_coins')
          .eq('id', orderId)
          .single();

        if (order && order.discount_due_coins > 0) {
          // Deduct coins from user balance
          await supabase
            .from('profiles')
            .update({
              due_coins: supabase.sql`due_coins - ${order.discount_due_coins}`,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

          // Add to wallet ledger
          await supabase
            .from('wallet_ledger')
            .insert({
              user_id: user.id,
              delta_coins: -order.discount_due_coins,
              reason: 'Order payment - coins redeemed',
              order_id: orderId
            });
        }
      }

      await fetchOrders();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  return {
    orders,
    loading,
    createOrder,
    updateOrderStatus,
    refetchOrders: fetchOrders
  };
};
