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
  customerType: 'Retail' | 'Wholesale' | 'Distributor';
  address: string;
  status: 'Lead' | 'Active' | 'Inactive';
  followUpDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CustomerForm {
  customerName: string;
  mobileNumber: string;
  email: string;
  businessName: string;
  gstNumber: string;
  customerType: 'Retail' | 'Wholesale' | 'Distributor';
  address: string;
  status: 'Lead' | 'Active' | 'Inactive';
  followUpDate: string;
  notes: string;
}

const emptyForm: CustomerForm = {
  customerName: '',
  mobileNumber: '',
  email: '',
  businessName: '',
  gstNumber: '',
  customerType: 'Retail',
  address: '',
  status: 'Lead',
  followUpDate: '',
  notes: '',
};

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [search, setSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerForm>(emptyForm);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await apiRequest<Customer[]>('/customers');
      setCustomers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load customers',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearch = async (value: string) => {
    setSearch(value);
    setError('');

    if (!value.trim()) {
      loadCustomers();
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest<Customer[]>(
        `/customers/search?q=${encodeURIComponent(value.trim())}`,
      );

      setCustomers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to search customers',
      );
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingCustomer(null);
    setForm(emptyForm);
    setShowForm(true);
    setSelectedCustomer(null);
    setSuccess('');
    setError('');
  };

  const openEditForm = (customer: Customer) => {
    setEditingCustomer(customer);

    setForm({
      customerName: customer.customerName,
      mobileNumber: customer.mobileNumber,
      email: customer.email,
      businessName: customer.businessName,
      gstNumber: customer.gstNumber || '',
      customerType: customer.customerType,
      address: customer.address,
      status: customer.status,
      followUpDate: customer.followUpDate
        ? customer.followUpDate.substring(0, 10)
        : '',
      notes: customer.notes || '',
    });

    setShowForm(true);
    setSelectedCustomer(null);
    setSuccess('');
    setError('');
  };

  const handleChange = (
    field: keyof CustomerForm,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        customerName: form.customerName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        email: form.email.trim(),
        businessName: form.businessName.trim(),
        gstNumber: form.gstNumber.trim() || undefined,
        customerType: form.customerType,
        address: form.address.trim(),
        status: form.status,
        followUpDate: form.followUpDate || undefined,
        notes: form.notes.trim() || undefined,
      };

      if (editingCustomer) {
        await apiRequest<Customer>(
          `/customers/${editingCustomer.id}`,
          {
            method: 'PATCH',
            body: JSON.stringify(payload),
          },
        );

        setSuccess('Customer updated successfully.');
      } else {
        await apiRequest<Customer>('/customers', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        setSuccess('Customer added successfully.');
      }

      setShowForm(false);
      setEditingCustomer(null);
      setForm(emptyForm);

      await loadCustomers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save customer',
      );
    } finally {
      setSaving(false);
    }
  };

  const openDetails = async (customer: Customer) => {
    try {
      setError('');

      const freshCustomer = await apiRequest<Customer>(
        `/customers/${customer.id}`,
      );

      setSelectedCustomer(freshCustomer);
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load customer details',
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await apiRequest(`/customers/${selectedCustomer.id}`, {
        method: 'DELETE',
      });

      setSelectedCustomer(null);
      setShowDeleteConfirm(false);
      setSuccess('Customer deleted successfully.');

      await loadCustomers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete customer',
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) {
      return '—';
    }

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusClass = (status: Customer['status']) => {
    if (status === 'Active') {
      return 'customer-status active';
    }

    if (status === 'Inactive') {
      return 'customer-status inactive';
    }

    return 'customer-status lead';
  };

  
    return (
  <div className="customers-page">
    <div className="customers-header">
      <button
        className="customer-primary-button"
        onClick={openAddForm}
      >
        + Add Customer
      </button>
    </div>

      {error && (
        <div className="customer-alert customer-alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="customer-alert customer-alert-success">
          {success}
        </div>
      )}

      <div className="customer-toolbar">
        <div className="customer-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search by customer, business or mobile..."
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
          />
        </div>

        <div className="customer-count">
          {customers.length} customer{customers.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="customer-card">
        {loading ? (
          <div className="customer-state">
            <div className="customer-spinner" />
            <p>Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="customer-state">
            <div className="customer-empty-icon">👥</div>
            <h3>No customers found</h3>
            <p>
              {search
                ? 'Try a different search term.'
                : 'Add your first customer to get started.'}
            </p>
          </div>
        ) : (
          <div className="customer-table-wrapper">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Business</th>
                  <th>Mobile</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Follow-up</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customer-name-cell">
                        <div className="customer-avatar">
                          {customer.customerName
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>{customer.customerName}</strong>
                          <span>{customer.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>{customer.businessName}</td>

                    <td>{customer.mobileNumber}</td>

                    <td>{customer.customerType}</td>

                    <td>
                      <span className={getStatusClass(customer.status)}>
                        {customer.status}
                      </span>
                    </td>

                    <td>{formatDate(customer.followUpDate)}</td>

                    <td>
                      <div className="customer-actions">
                        <button
                          className="customer-action-button"
                          onClick={() => openDetails(customer)}
                        >
                          View
                        </button>

                        <button
                          className="customer-action-button"
                          onClick={() => openEditForm(customer)}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="customer-modal-overlay">
          <div className="customer-modal">
            <div className="customer-modal-header">
              <div>
                <h2>
                  {editingCustomer ? 'Edit Customer' : 'Add Customer'}
                </h2>
                <p>
                  {editingCustomer
                    ? 'Update customer information.'
                    : 'Enter the customer details below.'}
                </p>
              </div>

              <button
                className="customer-close-button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="customer-form-grid">
                <div className="customer-form-field">
                  <label>Customer Name *</label>
                  <input
                    required
                    value={form.customerName}
                    onChange={(event) =>
                      handleChange('customerName', event.target.value)
                    }
                    placeholder="Enter customer name"
                  />
                </div>

                <div className="customer-form-field">
                  <label>Mobile Number *</label>
                  <input
                    required
                    value={form.mobileNumber}
                    onChange={(event) =>
                      handleChange('mobileNumber', event.target.value)
                    }
                    placeholder="Enter mobile number"
                  />
                </div>

                <div className="customer-form-field">
                  <label>Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      handleChange('email', event.target.value)
                    }
                    placeholder="Enter email"
                  />
                </div>

                <div className="customer-form-field">
                  <label>Business Name *</label>
                  <input
                    required
                    value={form.businessName}
                    onChange={(event) =>
                      handleChange('businessName', event.target.value)
                    }
                    placeholder="Enter business name"
                  />
                </div>

                <div className="customer-form-field">
                  <label>GST Number</label>
                  <input
                    value={form.gstNumber}
                    onChange={(event) =>
                      handleChange('gstNumber', event.target.value)
                    }
                    placeholder="Optional"
                  />
                </div>

                <div className="customer-form-field">
                  <label>Customer Type *</label>
                  <select
                    value={form.customerType}
                    onChange={(event) =>
                      handleChange(
                        'customerType',
                        event.target.value,
                      )
                    }
                  >
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Distributor">Distributor</option>
                  </select>
                </div>

                <div className="customer-form-field">
                  <label>Status *</label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      handleChange('status', event.target.value)
                    }
                  >
                    <option value="Lead">Lead</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="customer-form-field">
                  <label>Follow-up Date</label>
                  <input
                    type="date"
                    value={form.followUpDate}
                    onChange={(event) =>
                      handleChange('followUpDate', event.target.value)
                    }
                  />
                </div>

                <div className="customer-form-field customer-form-full">
                  <label>Address *</label>
                  <textarea
                    required
                    value={form.address}
                    onChange={(event) =>
                      handleChange('address', event.target.value)
                    }
                    placeholder="Enter address"
                    rows={3}
                  />
                </div>

                <div className="customer-form-field customer-form-full">
                  <label>Follow-up Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(event) =>
                      handleChange('notes', event.target.value)
                    }
                    placeholder="Add notes about the customer or follow-up..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="customer-modal-footer">
                <button
                  type="button"
                  className="customer-secondary-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="customer-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : editingCustomer
                      ? 'Update Customer'
                      : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <div className="customer-modal-overlay">
          <div className="customer-modal customer-detail-modal">
            <div className="customer-modal-header">
              <div>
                <h2>{selectedCustomer.customerName}</h2>
                <p>Customer details and follow-up information</p>
              </div>

              <button
                className="customer-close-button"
                onClick={() => setSelectedCustomer(null)}
              >
                ×
              </button>
            </div>

            <div className="customer-detail-content">
              <div className="customer-detail-top">
                <div className="customer-large-avatar">
                  {selectedCustomer.customerName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h3>{selectedCustomer.customerName}</h3>
                  <p>{selectedCustomer.businessName}</p>
                  <span
                    className={getStatusClass(selectedCustomer.status)}
                  >
                    {selectedCustomer.status}
                  </span>
                </div>
              </div>

              <div className="customer-detail-grid">
                <div>
                  <label>Email</label>
                  <p>{selectedCustomer.email}</p>
                </div>

                <div>
                  <label>Mobile</label>
                  <p>{selectedCustomer.mobileNumber}</p>
                </div>

                <div>
                  <label>Customer Type</label>
                  <p>{selectedCustomer.customerType}</p>
                </div>

                <div>
                  <label>GST Number</label>
                  <p>{selectedCustomer.gstNumber || '—'}</p>
                </div>

                <div>
                  <label>Follow-up Date</label>
                  <p>{formatDate(selectedCustomer.followUpDate)}</p>
                </div>

                <div>
                  <label>Address</label>
                  <p>{selectedCustomer.address}</p>
                </div>
              </div>

              <div className="customer-detail-notes">
                <label>Follow-up Notes</label>
                <div>
                  {selectedCustomer.notes || 'No follow-up notes added.'}
                </div>
              </div>
            </div>

            <div className="customer-modal-footer">
              <button
                className="customer-danger-button"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete
              </button>

              <div className="customer-footer-right">
                <button
                  className="customer-secondary-button"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Close
                </button>

                <button
                  className="customer-primary-button"
                  onClick={() => openEditForm(selectedCustomer)}
                >
                  Edit Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && selectedCustomer && (
        <div className="customer-modal-overlay">
          <div className="customer-confirm-modal">
            <h2>Delete Customer?</h2>

            <p>
              Are you sure you want to delete{' '}
              <strong>{selectedCustomer.customerName}</strong>?
              This action cannot be undone.
            </p>

            <div className="customer-modal-footer">
              <button
                className="customer-secondary-button"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>

              <button
                className="customer-danger-button"
                onClick={handleDelete}
                disabled={saving}
              >
                {saving ? 'Deleting...' : 'Delete Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;