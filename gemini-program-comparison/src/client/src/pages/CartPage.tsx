import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CartPage() {
  const { cart, removeFromCart, checkout, isLoading } = useStore();
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const handleCheckout = async () => {
    await checkout();
    setCheckoutSuccess(true);
  };

  if (checkoutSuccess) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
            <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center text-green-500 mb-4">
                <ShoppingBag className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-bold">Order Confirmed!</h1>
            <p className="text-muted-foreground max-w-md">
                Thank you for your simulated purchase. Your cart has been cleared.
                Since this is a demo, no actual items will be shipped.
            </p>
            <Link to="/store">
                <Button className="mt-4">Continue Shopping</Button>
            </Link>
        </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
            <h1 className="text-2xl font-bold">Your cart is empty</h1>
            <p className="text-muted-foreground">Looks like you haven't added anything yet.</p>
            <Link to="/store">
                <Button variant="outline" className="mt-4">Browse Store</Button>
            </Link>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
            {cart.items.map(item => (
                <Card key={item.id} className="flex flex-row items-center p-4 gap-4">
                    <div className="h-20 w-20 bg-muted rounded-md overflow-hidden shrink-0">
                        <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium">{item.productName}</h3>
                        <p className="text-sm text-muted-foreground">${item.price}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm">Qty: {item.quantity}</span>
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => removeFromCart(item.id)}
                            disabled={isLoading}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </Card>
            ))}
        </div>

        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${cart.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-green-500">Free</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between font-bold">
                        <span>Total</span>
                        <span>${cart.totalPrice.toFixed(2)}</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isLoading}>
                        {isLoading ? 'Processing...' : 'Checkout'}
                        {!isLoading && <ArrowRight className="h-4 w-4 ml-2" />}
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
