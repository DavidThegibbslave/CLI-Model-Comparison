import { useState, useEffect, useRef } from 'react';
import { CryptoPrice } from '@/hooks/useSignalR';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sparkline } from './Sparkline';

interface Props {
  prices: CryptoPrice[];
}

type SortConfig = {
  key: keyof CryptoPrice;
  direction: 'asc' | 'desc';
};

const PriceCell = ({ price, prevPrice }: { price: number, prevPrice: number | undefined }) => {
    const [flashClass, setFlashClass] = useState('');
    
    useEffect(() => {
        if (prevPrice && price > prevPrice) {
            setFlashClass('animate-flash-green');
        } else if (prevPrice && price < prevPrice) {
            setFlashClass('animate-flash-red');
        }
        
        const timer = setTimeout(() => setFlashClass(''), 1000);
        return () => clearTimeout(timer);
    }, [price, prevPrice]);

    return (
        <span className={cn("px-2 py-1 rounded transition-colors", flashClass)}>
            ${price.toLocaleString()}
        </span>
    )
}

export function CryptoTable({ prices }: Props) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'market_cap', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Keep track of previous prices for flashing
  const prevPricesRef = useRef<Record<string, number>>({});
  const prevPrices = prevPricesRef.current;

  // Update refs *after* render logic but before next effect? 
  // Actually standard pattern is to use a custom hook or just pass prev down.
  // Let's update the ref at the end of render so it's ready for next comparison?
  // No, we need the *previous* render's value.
  
  useEffect(() => {
      prices.forEach(p => {
          prevPricesRef.current[p.id] = p.current_price;
      });
  }, [prices]);

  if (!prices || prices.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground animate-pulse">
        Loading market data...
      </div>
    );
  }

  const sortedData = [...prices]
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  const handleSort = (key: keyof CryptoPrice) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const SortIcon = ({ column }: { column: keyof CryptoPrice }) => {
      if (sortConfig.key !== column) return <span className="w-4 inline-block" />;
      return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 inline ml-1" /> : <ArrowDown className="w-3 h-3 inline ml-1" />;
  }

  return (
    <div className="space-y-4">
        <input 
            type="text" 
            placeholder="Search assets..." 
            className="w-full max-w-sm px-3 py-2 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
        />

        <div className="relative w-full overflow-auto rounded-md border">
        <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b bg-card">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort('market_cap_rank')}>
                    Rank <SortIcon column="market_cap_rank" />
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort('name')}>
                    Asset <SortIcon column="name" />
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort('current_price')}>
                    Price <SortIcon column="current_price" />
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort('price_change_percentage_24h')}>
                    24h % <SortIcon column="price_change_percentage_24h" />
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort('market_cap')}>
                    Market Cap <SortIcon column="market_cap" />
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => handleSort('total_volume')}>
                    Volume (24h) <SortIcon column="total_volume" />
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground hidden md:table-cell">
                    Last 7 Days
                </th>
            </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0 bg-card">
            {sortedData.map((coin) => (
                <tr key={coin.id} className="border-b transition-colors hover:bg-muted/50">
                <td className="p-4 align-middle font-medium text-muted-foreground">
                    {coin.market_cap_rank}
                </td>
                <td className="p-4 align-middle font-medium">
                    <div className="flex items-center gap-2">
                    <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full" />
                    <div className="flex flex-col">
                        <span>{coin.name}</span>
                        <span className="text-muted-foreground text-xs uppercase">{coin.symbol}</span>
                    </div>
                    </div>
                </td>
                <td className="p-4 align-middle text-right font-mono">
                    <PriceCell price={coin.current_price} prevPrice={prevPrices[coin.id]} />
                </td>
                <td className="p-4 align-middle text-right">
                    <div className={`flex items-center justify-end gap-1 ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                    {coin.price_change_percentage_24h >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </div>
                </td>
                <td className="p-4 align-middle text-right text-muted-foreground">
                    ${(coin.market_cap / 1e9).toFixed(2)}B
                </td>
                <td className="p-4 align-middle text-right text-muted-foreground">
                    ${(coin.total_volume / 1e6).toFixed(2)}M
                </td>
                <td className="p-4 align-middle text-right hidden md:table-cell">
                    {/* Mock Sparkline Data - In real app, fetch history or include in API response */}
                    <Sparkline 
                        data={[
                            coin.current_price * 0.9, 
                            coin.current_price * 0.95, 
                            coin.current_price * 0.92, 
                            coin.current_price * 1.02, 
                            coin.current_price
                        ]} 
                    />
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div>
  );
}