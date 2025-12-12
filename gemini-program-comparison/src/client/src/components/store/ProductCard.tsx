import { useState } from 'react';
import { Product } from '@/services/storeService';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStore } from '@/context/StoreContext';
import { ShoppingCart, Check } from 'lucide-react';

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const { addToCart, isLoading } = useStore();
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = async () => {
    await addToCart(product.id);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:border-primary/50">
      <div className="aspect-square w-full overflow-hidden bg-muted relative group">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="h-full w-full object-cover transition-transform group-hover:scale-105" 
        />
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {product.category}
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
      </CardContent>
      <CardFooter className="p-4 flex items-center justify-between border-t border-border/50 bg-card/50">
        <span className="text-lg font-bold">${product.price}</span>
        <Button 
            size="sm" 
            onClick={handleAdd} 
            disabled={isLoading || isAdded}
            variant={isAdded ? "outline" : "default"}
            className={isAdded ? "text-green-500 border-green-500" : ""}
        >
            {isAdded ? (
                <>
                    <Check className="h-4 w-4 mr-2" />
                    Added
                </>
            ) : (
                <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add
                </>
            )}
        </Button>
      </CardFooter>
    </Card>
  );
}
