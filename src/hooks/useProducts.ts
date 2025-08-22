
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  title: string;
  description: string | null;
  images: string[];
  price_inr: number;
  stock: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProducts = async (search?: string, page: number = 1, limit: number = 12) => {
    if (!user) return { data: [], count: 0 };

    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      return { data: data || [], count: count || 0 };
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error fetching products",
        description: error.message,
        variant: "destructive"
      });
      return { data: [], count: 0 };
    }
  };

  const getProduct = async (id: string): Promise<Product | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching product:', error);
      toast({
        title: "Error fetching product",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const { data } = await fetchProducts();
      setProducts(data);
      setLoading(false);
    };

    loadProducts();
  }, [user]);

  return {
    products,
    loading,
    fetchProducts,
    getProduct
  };
};
