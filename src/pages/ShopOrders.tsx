
import React from 'react';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrders } from '@/hooks/useOrders';
import { formatCurrency } from '@/utils/currency';
import Navbar from '@/components/layout/Navbar';

const ShopOrders = () => {
  const { orders, loading } = useOrders();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'paid':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Order History</h1>
        
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground">Your order history will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Badge variant={getStatusVariant(order.payment_status)} className="flex items-center gap-1">
                      {getStatusIcon(order.payment_status)}
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-2">
                      {Array.isArray(order.items_json) && order.items_json.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.product?.title || 'Product'} × {item.qty}</span>
                          <span>{formatCurrency(item.subtotal_inr)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>{formatCurrency(order.subtotal_inr)}</span>
                      </div>
                      
                      {order.discount_due_coins > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Due Coins Used ({order.discount_due_coins} coins)</span>
                          <span>-{formatCurrency(order.discount_due_coins * 100)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span>Tax</span>
                        <span>{formatCurrency(order.tax_inr)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span>{order.shipping_inr === 0 ? 'Free' : formatCurrency(order.shipping_inr)}</span>
                      </div>
                      
                      <div className="flex justify-between font-semibold border-t pt-2">
                        <span>Total Paid</span>
                        <span>{formatCurrency(order.total_payable_inr)}</span>
                      </div>
                    </div>

                    {order.payment_reference && (
                      <div className="text-xs text-muted-foreground">
                        Payment Reference: {order.payment_reference}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopOrders;
