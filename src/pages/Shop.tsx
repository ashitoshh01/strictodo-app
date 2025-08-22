
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useProducts, Product } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Search, Package } from 'lucide-react';
import { formatPrice } from '@/utils/currency';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Shop = () => {
  const navigate = useNavigate();
  const { flags, loading: flagsLoading } = useFeatureFlags();
  const { fetchProducts } = useProducts();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Redirect if e-commerce is disabled
  useEffect(() => {
    if (!flagsLoading && !flags.ecommerce) {
      navigate('/dashboard', { replace: true });
    }
  }, [flags.ecommerce, flagsLoading, navigate]);

  const loadProducts = async (search?: string, pageNum: number = 1) => {
    setLoading(true);
    try {
      const { data, count } = await fetchProducts(search, pageNum);
      setProducts(data);
      setTotalCount(count);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (flags.ecommerce) {
      loadProducts(searchTerm, page);
    }
  }, [flags.ecommerce, searchTerm, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProducts(searchTerm, 1);
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (flagsLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!flags.ecommerce) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Shop</h1>
            <p className="text-muted-foreground mt-2">
              Browse our productivity products and use your Due Coins for up to 15% discount!
            </p>
          </div>
          
          <Button
            onClick={() => navigate('/shop/cart')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart
          </Button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-md">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="secondary">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-48 bg-muted rounded-md"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4"></div>
                  <div className="h-6 bg-muted rounded w-24"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms.' : 'No products available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="aspect-square bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={product.images[0] || '/placeholder.svg'}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg line-clamp-2 mb-2">{product.title}</CardTitle>
                  <CardDescription className="line-clamp-3 mb-4">
                    {product.description || 'No description available'}
                  </CardDescription>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(product.price_inr)}
                    </div>
                    {product.stock > 0 ? (
                      <Badge variant="secondary">{product.stock} in stock</Badge>
                    ) : (
                      <Badge variant="destructive">Out of stock</Badge>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      Up to 15% off with Due Coins
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate(`/shop/product/${product.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalCount > 12 && (
          <div className="flex justify-center mt-8 gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {page} of {Math.ceil(totalCount / 12)}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(totalCount / 12)}
            >
              Next
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
