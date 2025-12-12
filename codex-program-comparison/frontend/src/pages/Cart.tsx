import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { useCart } from '../store/CartContext';

export default function CartPage() {
  const { cart, loading, error, updateQuantity, removeItem, checkout, refresh } = useCart();
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!cart) {
      void refresh();
    }
  }, [cart, refresh]);

  const total = useMemo(() => cart?.total ?? 0, [cart]);

  const hasItems = (cart?.items?.length ?? 0) > 0;

  async function handleQty(itemId: string, next: number) {
    if (next < 1) return;
    await updateQuantity(itemId, next);
  }

  async function handleCheckout() {
    const message = await checkout();
    setSuccess(message || 'Thank you for your demo purchase!');
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Cart</h1>
          <p className="section-subtitle">Visual checkout only; clears cart and logs the purchase.</p>
        </div>
        <Button variant="ghost" onClick={() => refresh()} isLoading={loading}>
          Refresh
        </Button>
      </div>

      <Card title="Your cart" subtitle="Quantities adjust in-place; remove items as needed.">
        {error && <div className="section-subtitle error">{error}</div>}
        {loading && (
          <div>
            <Skeleton height={18} />
            <Skeleton height={18} width="80%" />
          </div>
        )}

        {!loading && !hasItems && <div className="section-subtitle">Cart is empty. Add items from the store.</div>}

        <ul className="list">
          {cart?.items.map((item) => (
            <li key={item.id} className="list-item">
              <div>
                <strong>{item.name}</strong>
                <div className="section-subtitle">${item.price.toFixed(2)}</div>
              </div>
              <div className="inline-actions">
                <div className="inline-actions">
                  <Button variant="ghost" onClick={() => handleQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1 || loading}>
                    −
                  </Button>
                  <span>{item.quantity}</span>
                  <Button variant="ghost" onClick={() => handleQty(item.id, item.quantity + 1)} disabled={loading}>
                    +
                  </Button>
                </div>
                <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                <Button variant="ghost" onClick={() => removeItem(item.id)} disabled={loading}>
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>

        {hasItems && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <strong>Total</strong>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 12 }}>
              <Button variant="ghost" onClick={() => cart?.items.forEach((item) => void removeItem(item.id))} disabled={loading}>
                Clear
              </Button>
              <Button variant="secondary" onClick={handleCheckout} isLoading={loading}>
                Checkout
              </Button>
            </div>
          </>
        )}
      </Card>

      <Modal open={Boolean(success)} onClose={() => setSuccess(null)} title="Thank you for your demo purchase!">
        <p>{success}</p>
        <p className="section-subtitle">No payment was processed; your cart was cleared for this demo flow.</p>
      </Modal>

      {success && <Toast message="Cart cleared" type="success" onClose={() => setSuccess(null)} />}
    </div>
  );
}
