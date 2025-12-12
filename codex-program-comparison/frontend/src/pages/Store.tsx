import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { fetchProductById, fetchProducts } from '../services/storeService';
import type { Product } from '../types/store';
import { classNames } from '../utils/classNames';
import { useCart } from '../store/CartContext';

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingId, setAddingId] = useState<string | null>(null);
  const { addItem, loading: cartLoading } = useCart();

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchProducts()
      .then((data) => setProducts(data))
      .catch((err: any) => setError(err?.message || 'Unable to load products'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map((p) => p.category)))], [products]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category;
      const matchesSearch = !term || p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [products, search, category]);

  function handleAdd(product: Product, qty: number) {
    setAddingId(product.id);
    void addItem(product, qty).then(() => {
      setToast(`${product.name} added to cart`);
      setAddingId(null);
      setSelected(null);
      setQuantity(1);
    });
  }

  async function openProductDetail(id: string) {
    const found = products.find((p) => p.id === id);
    if (found) {
      setSelected(found);
      return;
    }
    const fetched = await fetchProductById(id);
    if (fetched) setSelected(fetched);
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Store</h1>
          <p className="section-subtitle">Visual-only store — checkout clears cart, no payments are processed.</p>
        </div>
        <div className="inline-actions">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field input-compact" style={{ width: 160 }}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <Input
            placeholder="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-compact"
            style={{ minWidth: 200 }}
          />
        </div>
      </div>

      {error && <div className="section-subtitle error">{error}</div>}

      <div className="product-grid">
        {loading
          ? Array.from({ length: 6 }).map((_, idx) => (
              <Card key={idx}>
                <Skeleton height={140} />
                <Skeleton height={18} />
                <Skeleton height={14} width="70%" />
              </Card>
            ))
          : filtered.map((product) => (
              <Card
                key={product.id}
                title={product.name}
                subtitle={`${product.category} • $${product.price}`}
                actions={<span className="tag">{product.category}</span>}
              >
                {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="product-image" />}
                <p>{product.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <strong>${product.price.toFixed(2)}</strong>
                  <div className="inline-actions">
                    <Button variant="ghost" onClick={() => openProductDetail(product.id)}>
                      View
                    </Button>
                    <Button
                      variant="secondary"
                      className={classNames(addingId === product.id && 'add-burst')}
                      isLoading={addingId === product.id || cartLoading}
                      onClick={() => handleAdd(product, 1)}
                    >
                      Add to cart
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? selected.name : ''}
        actions={
          selected && (
            <div className="inline-actions">
              <label className="input-wrapper" style={{ maxWidth: 160 }}>
                <span className="input-label">Quantity</span>
                <input
                  className="input-field"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                />
              </label>
              <Button
                variant="primary"
                isLoading={addingId === selected.id || cartLoading}
                onClick={() => selected && handleAdd(selected, quantity)}
              >
                Add to cart
              </Button>
            </div>
          )
        }
      >
        {selected && (
          <div style={{ display: 'grid', gap: 12 }}>
            {selected.imageUrl && (
              <img src={selected.imageUrl} alt={selected.name} style={{ width: '100%', borderRadius: 12, maxHeight: 260, objectFit: 'cover' }} />
            )}
            <p>{selected.description}</p>
            <div className="inline-actions">
              <strong>${selected.price.toFixed(2)}</strong>
              <span className="tag">{selected.category}</span>
            </div>
          </div>
        )}
      </Modal>

      {toast && <Toast message={toast} type="success" onClose={() => setToast(null)} />}
    </div>
  );
}
