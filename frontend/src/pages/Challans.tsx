import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { apiRequest } from '../services/api';

interface Customer {
  id: number;
  customerName: string;
  mobileNumber: string;
  email: string;
  businessName: string;
  gstNumber?: string;
  address: string;
}

interface Product {
  id: number;
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  warehouse: string;
}

interface ChallanProduct {
  productId: number;
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  quantity: number;
  warehouse: string;
}

interface CustomerSnapshot {
  customerName: string;
  mobileNumber: string;
  email: string;
  businessName: string;
  gstNumber?: string;
  address: string;
}

interface Challan {
  id: number;
  challanNumber: string;
  customerId: number;
  customerSnapshot: CustomerSnapshot;
  products: ChallanProduct[];
  totalQuantity: number;
  status: 'Draft' | 'Confirmed' | 'Cancelled';
  createdBy: string;
  createdAt: string;
}

interface ChallanLine {
  productId: string;
  quantity: string;
}

const emptyLine: ChallanLine = {
  productId: '',
  quantity: '1',
};

function Challans() {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [selectedChallan, setSelectedChallan] =
    useState<Challan | null>(null);

  const [customerId, setCustomerId] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [lines, setLines] = useState<ChallanLine[]>([
    { ...emptyLine },
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const [challanData, customerData, productData] =
        await Promise.all([
          apiRequest<Challan[]>('/challans'),
          apiRequest<Customer[]>('/customers'),
          apiRequest<Product[]>('/products'),
        ]);

      setChallans(challanData);
      setCustomers(customerData);
      setProducts(productData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load challan data.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getCurrentUsername = () => {
    try {
      const storedUser = localStorage.getItem('user');

      if (!storedUser) {
        return '';
      }

      const user = JSON.parse(storedUser);

      return user.username || '';
    } catch {
      return '';
    }
  };

  const openCreateForm = () => {
    setCustomerId('');
    setCreatedBy(getCurrentUsername());
    setLines([{ ...emptyLine }]);

    setSelectedChallan(null);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
  };

  const addLine = () => {
    setLines((previous) => [
      ...previous,
      { ...emptyLine },
    ]);
  };

  const removeLine = (index: number) => {
    setLines((previous) =>
      previous.filter((_, lineIndex) => lineIndex !== index),
    );
  };

  const updateLine = (
    index: number,
    field: keyof ChallanLine,
    value: string,
  ) => {
    setLines((previous) =>
      previous.map((line, lineIndex) =>
        lineIndex === index
          ? {
              ...line,
              [field]: value,
            }
          : line,
      ),
    );
  };

  const getSelectedProduct = (productId: string) => {
    return products.find(
      (product) => product.id === Number(productId),
    );
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (!customerId) {
        setError('Please select a customer.');
        return;
      }

      if (!createdBy.trim()) {
        setError('Created by is required.');
        return;
      }

      if (lines.length === 0) {
        setError('Add at least one product.');
        return;
      }

      const invalidLine = lines.find(
        (line) =>
          !line.productId ||
          !Number.isInteger(Number(line.quantity)) ||
          Number(line.quantity) <= 0,
      );

      if (invalidLine) {
        setError(
          'Every product must have a valid quantity greater than 0.',
        );
        return;
      }

      const productIds = lines.map((line) =>
        Number(line.productId),
      );

      const uniqueProductIds = new Set(productIds);

      if (uniqueProductIds.size !== productIds.length) {
        setError(
          'The same product cannot be added more than once. Adjust its quantity instead.',
        );
        return;
      }

      const selectedProducts = lines.map((line) => {
        const product = getSelectedProduct(line.productId);

        return {
          product,
          quantity: Number(line.quantity),
        };
      });

      const missingProduct = selectedProducts.find(
        (item) => !item.product,
      );

      if (missingProduct) {
        setError('One of the selected products is no longer available.');
        return;
      }

      await apiRequest<Challan>('/challans', {
        method: 'POST',
        body: JSON.stringify({
          customerId: Number(customerId),
          products: lines.map((line) => ({
            productId: Number(line.productId),
            quantity: Number(line.quantity),
          })),
          createdBy: createdBy.trim(),
        }),
      });

      setShowForm(false);
      setSuccess('Challan created successfully.');

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create challan.',
      );
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (
    challan: Challan,
    status: 'Confirmed' | 'Cancelled',
  ) => {
    const action =
      status === 'Confirmed'
        ? 'confirm'
        : 'cancel';

    const confirmed = window.confirm(
      `Are you sure you want to ${action} challan ${challan.challanNumber}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      await apiRequest<Challan>(
        `/challans/${challan.id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status,
          }),
        },
      );

      setSuccess(
        status === 'Confirmed'
          ? 'Challan confirmed successfully.'
          : 'Challan cancelled successfully.',
      );

      await loadData();

      const updatedChallan = await apiRequest<Challan>(
        `/challans/${challan.id}`,
      );

      setSelectedChallan(updatedChallan);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${action} challan.`,
      );
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return `₹${Number(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusClass = (status: Challan['status']) => {
    if (status === 'Confirmed') {
      return 'challan-status challan-status-confirmed';
    }

    if (status === 'Cancelled') {
      return 'challan-status challan-status-cancelled';
    }

    return 'challan-status challan-status-draft';
  };

  const totalDrafts = challans.filter(
    (challan) => challan.status === 'Draft',
  ).length;

  const totalConfirmed = challans.filter(
    (challan) => challan.status === 'Confirmed',
  ).length;

  const totalCancelled = challans.filter(
    (challan) => challan.status === 'Cancelled',
  ).length;

  return (
    <div className="challans-page">
      <div className="challans-toolbar">
        <div>
          <span className="challans-count">
            {challans.length}{' '}
            {challans.length === 1
              ? 'challan'
              : 'challans'}
          </span>
        </div>

        <button
          className="challans-primary-button"
          onClick={openCreateForm}
        >
          + Create Challan
        </button>
      </div>

      {error && (
        <div className="challans-alert challans-alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="challans-alert challans-alert-success">
          {success}
        </div>
      )}

      <div className="challans-summary">
        <div className="challans-summary-card">
          <span>Total Challans</span>
          <strong>{challans.length}</strong>
        </div>

        <div className="challans-summary-card">
          <span>Draft</span>
          <strong>{totalDrafts}</strong>
        </div>

        <div className="challans-summary-card">
          <span>Confirmed</span>
          <strong>{totalConfirmed}</strong>
        </div>

        <div className="challans-summary-card">
          <span>Cancelled</span>
          <strong>{totalCancelled}</strong>
        </div>
      </div>

      <div className="challans-card">
        {loading ? (
          <div className="challans-state">
            <div className="challans-spinner" />
            <p>Loading challans...</p>
          </div>
        ) : challans.length === 0 ? (
          <div className="challans-state">
            <div className="challans-empty-icon">▤</div>

            <h3>No challans found</h3>

            <p>
              Create your first sales challan to see it here.
            </p>
          </div>
        ) : (
          <div className="challans-table-wrapper">
            <table className="challans-table">
              <thead>
                <tr>
                  <th>Challan</th>
                  <th>Customer</th>
                  <th>Products</th>
                  <th>Total Qty</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {challans.map((challan) => (
                  <tr key={challan.id}>
                    <td>
                      <strong className="challan-number">
                        {challan.challanNumber}
                      </strong>
                    </td>

                    <td>
                      <div className="challan-customer-cell">
                        <strong>
                          {challan.customerSnapshot.customerName}
                        </strong>

                        <span>
                          {
                            challan.customerSnapshot
                              .businessName
                          }
                        </span>
                      </div>
                    </td>

                    <td>
                      {challan.products.length}{' '}
                      {challan.products.length === 1
                        ? 'item'
                        : 'items'}
                    </td>

                    <td>
                      <strong>
                        {challan.totalQuantity}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={getStatusClass(
                          challan.status,
                        )}
                      >
                        {challan.status}
                      </span>
                    </td>

                    <td>{challan.createdBy}</td>

                    <td>
                      {formatDate(challan.createdAt)}
                    </td>

                    <td>
                      <button
                        className="challan-action-button"
                        onClick={() =>
                          setSelectedChallan(challan)
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="challan-modal-overlay">
          <div className="challan-modal">
            <div className="challan-modal-header">
              <div>
                <h2>Create Sales Challan</h2>

                <p>
                  Create a draft challan for a customer.
                </p>
              </div>

              <button
                className="challan-close-button"
                onClick={closeForm}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="challan-form-grid">
                <div className="challan-form-field challan-form-full">
                  <label>Customer *</label>

                  <select
                    required
                    value={customerId}
                    onChange={(event) =>
                      setCustomerId(event.target.value)
                    }
                  >
                    <option value="">
                      Select a customer
                    </option>

                    {customers.map((customer) => (
                      <option
                        key={customer.id}
                        value={customer.id}
                      >
                        {customer.customerName} —{' '}
                        {customer.businessName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="challan-form-field challan-form-full">
                  <label>Created By *</label>

                  <input
                    required
                    value={createdBy}
                    onChange={(event) =>
                      setCreatedBy(event.target.value)
                    }
                    placeholder="Enter username"
                  />
                </div>
              </div>

              <div className="challan-products-header">
                <div>
                  <h3>Products</h3>

                  <p>
                    Add one or more products and quantities.
                  </p>
                </div>

                <button
                  type="button"
                  className="challan-add-line-button"
                  onClick={addLine}
                >
                  + Add Product
                </button>
              </div>

              <div className="challan-line-list">
                {lines.map((line, index) => {
                  const selectedProduct =
                    getSelectedProduct(line.productId);

                  return (
                    <div
                      className="challan-line"
                      key={index}
                    >
                      <div className="challan-form-field challan-line-product">
                        <label>
                          Product {index + 1} *
                        </label>

                        <select
                          required
                          value={line.productId}
                          onChange={(event) =>
                            updateLine(
                              index,
                              'productId',
                              event.target.value,
                            )
                          }
                        >
                          <option value="">
                            Select product
                          </option>

                          {products.map((product) => (
                            <option
                              key={product.id}
                              value={product.id}
                            >
                              {product.productName} —{' '}
                              {product.sku}
                            </option>
                          ))}
                        </select>

                        {selectedProduct && (
                          <small className="challan-stock-hint">
                            Stock: {selectedProduct.currentStock}{' '}
                            · {formatCurrency(
                              selectedProduct.unitPrice,
                            )}
                          </small>
                        )}
                      </div>

                      <div className="challan-form-field challan-line-quantity">
                        <label>Quantity *</label>

                        <input
                          required
                          type="number"
                          min="1"
                          step="1"
                          value={line.quantity}
                          onChange={(event) =>
                            updateLine(
                              index,
                              'quantity',
                              event.target.value,
                            )
                          }
                        />
                      </div>

                      {lines.length > 1 && (
                        <button
                          type="button"
                          className="challan-remove-line-button"
                          onClick={() =>
                            removeLine(index)
                          }
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="challan-modal-footer">
                <button
                  type="button"
                  className="challan-secondary-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="challans-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Creating...'
                    : 'Create Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedChallan && (
        <div className="challan-modal-overlay">
          <div className="challan-modal challan-detail-modal">
            <div className="challan-modal-header">
              <div>
                <h2>
                  {selectedChallan.challanNumber}
                </h2>

                <p>
                  Created on{' '}
                  {formatDate(
                    selectedChallan.createdAt,
                  )}
                </p>
              </div>

              <button
                className="challan-close-button"
                onClick={() =>
                  setSelectedChallan(null)
                }
              >
                ×
              </button>
            </div>

            <div className="challan-detail-body">
              <div className="challan-detail-top">
                <div>
                  <span>Customer</span>
                  <strong>
                    {
                      selectedChallan.customerSnapshot
                        .customerName
                    }
                  </strong>
                  <small>
                    {
                      selectedChallan.customerSnapshot
                        .businessName
                    }
                  </small>
                </div>

                <div>
                  <span>Mobile</span>
                  <strong>
                    {
                      selectedChallan.customerSnapshot
                        .mobileNumber
                    }
                  </strong>
                </div>

                <div>
                  <span>Created By</span>
                  <strong>
                    {selectedChallan.createdBy}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong>
                    <span
                      className={getStatusClass(
                        selectedChallan.status,
                      )}
                    >
                      {selectedChallan.status}
                    </span>
                  </strong>
                </div>
              </div>

              <div className="challan-customer-details">
                <div>
                  <span>Email</span>
                  <strong>
                    {
                      selectedChallan.customerSnapshot
                        .email
                    }
                  </strong>
                </div>

                <div>
                  <span>GST Number</span>
                  <strong>
                    {selectedChallan.customerSnapshot
                      .gstNumber || '—'}
                  </strong>
                </div>

                <div>
                  <span>Address</span>
                  <strong>
                    {
                      selectedChallan.customerSnapshot
                        .address
                    }
                  </strong>
                </div>
              </div>

              <div className="challan-products-detail">
                <h3>Products</h3>

                <div className="challan-detail-table-wrapper">
                  <table className="challan-detail-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Unit Price</th>
                        <th>Qty</th>
                        <th>Warehouse</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedChallan.products.map(
                        (product) => (
                          <tr key={product.productId}>
                            <td>
                              <strong>
                                {product.productName}
                              </strong>

                              <small>
                                {product.category}
                              </small>
                            </td>

                            <td>{product.sku}</td>

                            <td>
                              {formatCurrency(
                                product.unitPrice,
                              )}
                            </td>

                            <td>
                              <strong>
                                {product.quantity}
                              </strong>
                            </td>

                            <td>
                              {product.warehouse}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="challan-total-row">
                <span>Total Quantity</span>
                <strong>
                  {selectedChallan.totalQuantity}
                </strong>
              </div>
            </div>

            <div className="challan-modal-footer">
              {selectedChallan.status === 'Draft' && (
                <>
                  <button
                    className="challan-cancel-action"
                    onClick={() =>
                      updateStatus(
                        selectedChallan,
                        'Cancelled',
                      )
                    }
                  >
                    Cancel Challan
                  </button>

                  <button
                    className="challan-confirm-action"
                    onClick={() =>
                      updateStatus(
                        selectedChallan,
                        'Confirmed',
                      )
                    }
                  >
                    Confirm Challan
                  </button>
                </>
              )}

              <button
                className="challan-secondary-button"
                onClick={() =>
                  setSelectedChallan(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Challans;