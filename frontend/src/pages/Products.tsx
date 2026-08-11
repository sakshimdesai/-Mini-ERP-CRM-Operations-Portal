import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { apiRequest } from '../services/api';

interface Product {
  id: number;
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStockAlert: number;
  warehouse: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProductForm {
  productName: string;
  sku: string;
  category: string;
  unitPrice: string;
  currentStock: string;
  minimumStockAlert: string;
  warehouse: string;
}

const emptyForm: ProductForm = {
  productName: '',
  sku: '',
  category: '',
  unitPrice: '',
  currentStock: '',
  minimumStockAlert: '',
  warehouse: '',
};

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await apiRequest<Product[]>('/products');

      setProducts(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load products',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openAddForm = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);

    setForm({
      productName: product.productName,
      sku: product.sku,
      category: product.category,
      unitPrice: String(product.unitPrice),
      currentStock: String(product.currentStock),
      minimumStockAlert: String(product.minimumStockAlert),
      warehouse: product.warehouse,
    });

    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleChange = (
    field: keyof ProductForm,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleNumberChange = (
    field: keyof ProductForm,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;

    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      handleChange(field, value);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        productName: form.productName.trim(),
        sku: form.sku.trim(),
        category: form.category.trim(),
        unitPrice: Number(form.unitPrice),
        currentStock: Number(form.currentStock),
        minimumStockAlert: Number(form.minimumStockAlert),
        warehouse: form.warehouse.trim(),
      };

      if (
        !payload.productName ||
        !payload.sku ||
        !payload.category ||
        !payload.warehouse
      ) {
        setError('Please fill in all required fields.');
        return;
      }

      if (
        !Number.isFinite(payload.unitPrice) ||
        payload.unitPrice < 0
      ) {
        setError('Unit price must be a valid non-negative number.');
        return;
      }

      if (
        !Number.isFinite(payload.currentStock) ||
        payload.currentStock < 0
      ) {
        setError('Current stock must be a valid non-negative number.');
        return;
      }

      if (
        !Number.isFinite(payload.minimumStockAlert) ||
        payload.minimumStockAlert < 0
      ) {
        setError(
          'Minimum stock alert must be a valid non-negative number.',
        );
        return;
      }

      if (editingProduct) {
        await apiRequest<Product>(
          `/products/${editingProduct.id}`,
          {
            method: 'PATCH',
            body: JSON.stringify(payload),
          },
        );

        setSuccess('Product updated successfully.');
      } else {
        await apiRequest<Product>('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        setSuccess('Product added successfully.');
      }

      setShowForm(false);
      setEditingProduct(null);
      setForm(emptyForm);

      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save product',
      );
    } finally {
      setSaving(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(price);
  };

  const isLowStock = (product: Product) => {
    return product.currentStock <= product.minimumStockAlert;
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <button
          className="product-primary-button"
          onClick={openAddForm}
        >
          + Add Product
        </button>
      </div>

      {error && (
        <div className="product-alert product-alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="product-alert product-alert-success">
          {success}
        </div>
      )}

      <div className="product-summary">
        <span>
          {products.length} product
          {products.length !== 1 ? 's' : ''}
        </span>

        <span>
          {products.filter(isLowStock).length} low-stock alert
          {products.filter(isLowStock).length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="product-card">
        {loading ? (
          <div className="product-state">
            <div className="product-spinner" />
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="product-state">
            <div className="product-empty-icon">□</div>

            <h3>No products found</h3>

            <p>
              Add your first product to start managing the catalogue.
            </p>
          </div>
        ) : (
          <div className="product-table-wrapper">
            <table className="product-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Current Stock</th>
                  <th>Minimum Alert</th>
                  <th>Warehouse</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const lowStock = isLowStock(product);

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="product-name-cell">
                          <div className="product-avatar">
                            {product.productName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>{product.productName}</strong>
                            <span>
                              Product #{product.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="product-sku">
                          {product.sku}
                        </span>
                      </td>

                      <td>{product.category}</td>

                      <td>
                        <strong>
                          {formatPrice(product.unitPrice)}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={
                            lowStock
                              ? 'product-stock low'
                              : 'product-stock'
                          }
                        >
                          {product.currentStock}
                        </span>
                      </td>

                      <td>{product.minimumStockAlert}</td>

                      <td>{product.warehouse}</td>

                      <td>
                        <button
                          className="product-action-button"
                          onClick={() => openEditForm(product)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="product-modal-overlay">
          <div className="product-modal">
            <div className="product-modal-header">
              <div>
                <h2>
                  {editingProduct
                    ? 'Edit Product'
                    : 'Add Product'}
                </h2>

                <p>
                  {editingProduct
                    ? 'Update product and stock information.'
                    : 'Enter the product details below.'}
                </p>
              </div>

              <button
                className="product-close-button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="product-form-grid">
                <div className="product-form-field product-form-full">
                  <label>Product Name *</label>

                  <input
                    required
                    value={form.productName}
                    onChange={(event) =>
                      handleChange(
                        'productName',
                        event.target.value,
                      )
                    }
                    placeholder="Enter product name"
                  />
                </div>

                <div className="product-form-field">
                  <label>SKU / Code *</label>

                  <input
                    required
                    value={form.sku}
                    onChange={(event) =>
                      handleChange('sku', event.target.value)
                    }
                    placeholder="e.g. DL5450-001"
                  />
                </div>

                <div className="product-form-field">
                  <label>Category *</label>

                  <input
                    required
                    value={form.category}
                    onChange={(event) =>
                      handleChange(
                        'category',
                        event.target.value,
                      )
                    }
                    placeholder="e.g. Laptops"
                  />
                </div>

                <div className="product-form-field">
                  <label>Unit Price (₹) *</label>

                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.unitPrice}
                    onChange={(event) =>
                      handleNumberChange(
                        'unitPrice',
                        event,
                      )
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="product-form-field">
                  <label>Current Stock *</label>

                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.currentStock}
                    onChange={(event) =>
                      handleNumberChange(
                        'currentStock',
                        event,
                      )
                    }
                    placeholder="0"
                  />
                </div>

                <div className="product-form-field">
                  <label>Minimum Stock Alert *</label>

                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.minimumStockAlert}
                    onChange={(event) =>
                      handleNumberChange(
                        'minimumStockAlert',
                        event,
                      )
                    }
                    placeholder="0"
                  />
                </div>

                <div className="product-form-field">
                  <label>Warehouse *</label>

                  <input
                    required
                    value={form.warehouse}
                    onChange={(event) =>
                      handleChange(
                        'warehouse',
                        event.target.value,
                      )
                    }
                    placeholder="e.g. Warehouse A"
                  />
                </div>
              </div>

              <div className="product-modal-footer">
                <button
                  type="button"
                  className="product-secondary-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="product-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editingProduct
                      ? 'Update Product'
                      : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;