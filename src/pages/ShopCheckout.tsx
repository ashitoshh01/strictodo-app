
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/currency';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';

const ShopCheckout = () => {
  const { cart, loading: cartLoading } = useCart();
  const { createOrder, updateOrderStatus } = useOrders();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [coinsToUse, setCoinsToUse] = useState(0);
  const [processing, setProcessing] = useState(false);

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    navigate('/shop/cart');
    return null;
  }

  const userBalance = userProfile?.due_coins || 0;
  const maxUsable = Math.floor(0.15 * cart.subtotal / 100); // 15% of subtotal in coins
  const coinsAvailable = Math.min(userBalance, maxUsable);
  
  const coinDiscount = coinsToUse * 100; // Convert coins to paise
  const subtotalAfterCoins = Math.max(cart.subtotal - coinDiscount, 0);
  const tax = Math.floor(subtotalAfterCoins * 0.18); // 18% GST
  const shipping = cart.subtotal > 50000 ? 0 : 5000; // Free shipping above ₹500
  const total = subtotalAfterCoins + tax + shipping;

  const handlePlaceOrder = async () => {
    setProcessing(true);
    try {
      const order = await createOrder(cart.items, coinsToUse);
      
      // Simulate payment processing
      setTimeout(async () => {
        try {
          await updateOrderStatus(order.id, 'paid', `PAY_${Date.now()}`);
          toast({
            title: "Order placed successfully!",
            description: "Your order has been confirmed and is being processed.",
          });
          navigate('/shop/orders');
        } catch (error) {
          toast({
            title: "Payment failed",
            description: "There was an issue processing your payment.",
            variant: "destructive"
          });
          await updateOrderStatus(order.id, 'failed');
        }
        setProcessing(false);
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error placing order",
        description: error.message,
        variant: "destructive"
      });
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <h1 className="text-3xl font-bold mb-6">Checkout</h1>
            
            {/* Due Coins Section */}
            {coinsAvailable > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    Use Due Coins
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Your balance: {userBalance} coins</span>
                    <span>Max usable: {coinsAvailable} coins</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Coins to use: {coinsToUse}</Label>
                    <Slider
                      value={[coinsToUse]}
                      onValueChange={(value) => setCoinsToUse(value[0])}
                      max={coinsAvailable}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Discount: {formatCurrency(coinDiscount)}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input id="expiryDate" placeholder="MM/YY" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                  <div>
                    <Label htmlFor="cardName">Cardholder Name</Label>
                    <Input id="cardName" placeholder="John Doe" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-2">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product.title} × {item.qty}</span>
                      <span>{formatCurrency(item.subtotal_inr)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cart.subtotal)}</span>
                  </div>
                  
                  {coinsToUse > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Due Coins Discount ({coinsToUse} coins)</span>
                      <span>-{formatCurrency(coinDiscount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Tax (18% GST)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : `Pay ${formatCurrency(total)}`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCheckout;
