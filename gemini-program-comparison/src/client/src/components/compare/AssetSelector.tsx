import { CryptoPrice } from '@/hooks/useSignalR';
import { X } from 'lucide-react';

interface Props {
  assets: CryptoPrice[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function AssetSelector({ assets, selectedIds, onToggle }: Props) {
  // Simple horizontal scroll list of chips
  return (
    <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-card/50">
      <div className="w-full text-sm text-muted-foreground mb-2">
        Select assets to compare (Max 5)
      </div>
      {assets.map(asset => {
        const isSelected = selectedIds.includes(asset.id);
        return (
            <button
                key={asset.id}
                onClick={() => onToggle(asset.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isSelected 
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
            >
                <img src={asset.image} alt={asset.symbol} className="h-4 w-4 rounded-full" />
                {asset.symbol.toUpperCase()}
                {isSelected && <X className="h-3 w-3 ml-1 opacity-50 hover:opacity-100" />}
            </button>
        )
      })}
    </div>
  );
}
