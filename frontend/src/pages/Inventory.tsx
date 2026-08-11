import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { apiRequest } from '../services/api';

interface Product {
  id: number;
  productName: string;
  sku: string;
  currentStock: number;
  warehouse: string;
}

interface StockMovement {
  id: number;
  productId: number;
  quantity: number;
  movementType: 'IN' | 'OUT';
  reason: string;
  createdBy: string;
  timestamp: string;
}

interface MovementForm {
  productId: string;
  quantity: string;
  movementType: 'IN' | 'OUT';
  reason: string;
  createdBy: string;
}

const emptyForm: MovementForm = {
  productId: '',
  quantity: '',
  movementType: 'IN',
  reason: '',
  createdBy: '',
};

function Inventory() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<MovementForm>(emptyForm);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [movementData, productData] = await Promise.all([
        apiRequest<StockMovement[]>('/stock-movements'),
        apiRequest<Product[]>('/products'),
      ]);

      setMovements(movementData);
      setProducts(productData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load inventory data',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddForm = () => {
    setForm({
      ...emptyForm,
      createdBy: localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user') || '{}').username || ''
        : '',
    });

    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const productId = Number(form.productId);
      const quantity = Number(form.quantity);

      if (!productId) {
        setError('Please select a product.');
        return;
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        setError('Quantity must be greater than 0.');
        return;
      }

      if (!form.reason.trim()) {
        setError('Please enter a reason for the movement.');
        return;
      }

      if (!form.createdBy.trim()) {
        setError('Created by is required.');
        return;
      }

      const selectedProduct = products.find(
        (product) => product.id === productId,
      );

      if (!selectedProduct) {
        setError('Selected product was not found.');
        return;
      }

      if (
        form.movementType === 'OUT' &&
        quantity > selectedProduct.currentStock
      ) {
        setError(
          `Insufficient stock. ${selectedProduct.productName} currently has ${selectedProduct.currentStock} unit(s).`,
        );
        return;
      }

      await apiRequest<StockMovement>('/stock-movements', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          quantity,
          movementType: form.movementType,
          reason: form.reason.trim(),
          createdBy: form.createdBy.trim(),
        }),
      });

      setShowForm(false);
      setForm(emptyForm);
      setSuccess('Stock movement recorded successfully.');

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to record stock movement',
      );
    } finally {
      setSaving(false);
    }
  };

  const getProductName = (productId: number) => {
    const product = products.find(
      (item) => item.id === productId,
    );

    return product
      ? product.productName
      : `Product #${productId}`;
  };

  const getProductSku = (productId: number) => {
    const product = products.find(
      (item) => item.id === productId,
    );

    return product?.sku || '—';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalMovements = movements.length;

  const totalIn = movements
    .filter((movement) => movement.movementType === 'IN')
    .reduce((sum, movement) => sum + movement.quantity, 0);

  const totalOut = movements
    .filter((movement) => movement.movementType === 'OUT')
    .reduce((sum, movement) => sum + movement.quantity, 0);

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <button
          className="inventory-primary-button"
          onClick={openAddForm}
        >
          + Record Movement
        </button>
      </div>

      {error && (
        <div className="inventory-alert inventory-alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="inventory-alert inventory-alert-success">
          {success}
        </div>
      )}

      <div className="inventory-summary">
        <div className="inventory-summary-card">
          <span>Total Movements</span>
          <strong>{totalMovements}</strong>
        </div>

        <div className="inventory-summary-card">
          <span>Stock In</span>
          <strong>{totalIn}</strong>
          <small>units received</small>
        </div>

        <div className="inventory-summary-card">
          <span>Stock Out</span>
          <strong>{totalOut}</strong>
          <small>units issued</small>
        </div>
      </div>

      <div className="inventory-card">
        {loading ? (
          <div className="inventory-state">
            <div className="inventory-spinner" />
            <p>Loading stock movements...</p>
          </div>
        ) : movements.length === 0 ? (
          <div className="inventory-state">
            <div className="inventory-empty-icon">↕</div>

            <h3>No stock movements found</h3>

            <p>
              Record your first stock movement to see it here.
            </p>
          </div>
        ) : (
          <div className="inventory-table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Movement</th>
                  <th>Quantity</th>
                  <th>Reason</th>
                  <th>Created By</th>
                  <th>Timestamp</th>
                </tr>
              </thead>

              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td>
                      <div className="inventory-product-cell">
                        <div className="inventory-product-avatar">
                          {getProductName(movement.productId)
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {getProductName(movement.productId)}
                          </strong>

                          <span>
                            {getProductSku(movement.productId)}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={
                          movement.movementType === 'IN'
                            ? 'movement-badge movement-in'
                            : 'movement-badge movement-out'
                        }
                      >
                        {movement.movementType === 'IN'
                          ? '↑ IN'
                          : '↓ OUT'}
                      </span>
                    </td>

                    <td>
                      <strong
                        className={
                          movement.movementType === 'IN'
                            ? 'movement-quantity movement-quantity-in'
                            : 'movement-quantity movement-quantity-out'
                        }
                      >
                        {movement.movementType === 'IN'
                          ? `+${movement.quantity}`
                          : `-${movement.quantity}`}
                      </strong>
                    </td>

                    <td>{movement.reason}</td>

                    <td>{movement.createdBy}</td>

                    <td>
                      {formatTimestamp(movement.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="inventory-modal-overlay">
          <div className="inventory-modal">
            <div className="inventory-modal-header">
              <div>
                <h2>Record Stock Movement</h2>

                <p>
                  Record an IN or OUT movement for a product.
                </p>
              </div>

              <button
                className="inventory-close-button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="inventory-form-grid">
                <div className="inventory-form-field inventory-form-full">
                  <label>Product *</label>

                  <select
                    required
                    value={form.productId}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        productId: event.target.value,
                      }))
                    }
                  >
                    <option value="">
                      Select a product
                    </option>

                    {products.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.productName} — {product.sku} —
                        Stock: {product.currentStock}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="inventory-form-field">
                  <label>Movement Type *</label>

                  <select
                    required
                    value={form.movementType}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        movementType: event.target.value as
                          | 'IN'
                          | 'OUT',
                      }))
                    }
                  >
                    <option value="IN">
                      IN — Stock received
                    </option>

                    <option value="OUT">
                      OUT — Stock issued
                    </option>
                  </select>
                </div>

                <div className="inventory-form-field">
                  <label>Quantity *</label>

                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    value={form.quantity}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        quantity: event.target.value,
                      }))
                    }
                    placeholder="Enter quantity"
                  />
                </div>

                <div className="inventory-form-field inventory-form-full">
                  <label>Reason *</label>

                  <input
                    required
                    value={form.reason}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        reason: event.target.value,
                      }))
                    }
                    placeholder="e.g. Purchase, Sale, Damaged, Stock adjustment"
                  />
                </div>

                <div className="inventory-form-field inventory-form-full">
                  <label>Created By *</label>

                  <input
                    required
                    value={form.createdBy}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        createdBy: event.target.value,
                      }))
                    }
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div className="inventory-modal-footer">
                <button
                  type="button"
                  className="inventory-secondary-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inventory-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Recording...'
                    : 'Record Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;