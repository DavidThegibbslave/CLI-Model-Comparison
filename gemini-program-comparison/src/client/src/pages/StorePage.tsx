import { useEffect, useState } from 'react';
import { storeService, Product } from '@/services/storeService';
import { ProductCard } from '@/components/store/ProductCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await storeService.getProducts();
        setProducts(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Merch Store</h1>
            <p className="text-muted-foreground">Get your official CryptoMarket gear.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search products..." 
                    className="pl-8"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
            <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    category === cat 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
            >
                {cat}
            </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
                <div key={i} className="h-[350px] bg-muted animate-pulse rounded-lg" />
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
            No products found matching your criteria.
        </div>
      )}
    </div>
  );
}
