import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { portfolioService } from '@/services/portfolioService';

interface Props {
  portfolioId: string;
  onOrderComplete: () => void;
}

export function OrderForm({ portfolioId, onOrderComplete }: Props) {
  const [type, setType] = useState<'Buy' | 'Sell'>('Buy');
  const [assetId, setAssetId] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (type === 'Buy') {
        await portfolioService.buy(portfolioId, assetId.toLowerCase(), quantity);
      } else {
        await portfolioService.sell(portfolioId, assetId.toLowerCase(), quantity);
      }
      onOrderComplete();
      setAssetId('');
      setQuantity(0);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Order failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg bg-card/50">
      <h3 className="font-semibold">Execute Order</h3>
      
      {error && <div className="text-sm text-destructive">{error}</div>}
      
      <div className="flex gap-2">
        <Button 
            type="button" 
            variant={type === 'Buy' ? 'default' : 'outline'} 
            onClick={() => setType('Buy')}
            className={type === 'Buy' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
            Buy
        </Button>
        <Button 
            type="button" 
            variant={type === 'Sell' ? 'default' : 'outline'} 
            onClick={() => setType('Sell')}
            className={type === 'Sell' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
            Sell
        </Button>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="asset">Asset Symbol (e.g., bitcoin)</Label>
        <Input 
            id="asset" 
            placeholder="bitcoin" 
            value={assetId} 
            onChange={(e) => setAssetId(e.target.value)} 
            required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input 
            id="quantity" 
            type="number" 
            step="any"
            placeholder="0.00" 
            value={quantity} 
            onChange={(e) => setQuantity(parseFloat(e.target.value))} 
            required
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Processing...' : `${type} ${assetId}`}
      </Button>
    </form>
  );
}
