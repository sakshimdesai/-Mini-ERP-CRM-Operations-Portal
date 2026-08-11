import { useState } from 'react';
import Login from './pages/Login';
import './index.css';

interface User {
  username: string;
  role: string;
}

function App() {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  });

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">ERP</div>
          <div>
            <strong>Mini ERP</strong>
            <span>Operations Portal</span>
          </div>
        </div>

        <nav>
          <button className="nav-item active">
            <span>▦</span>
            Dashboard
          </button>

          <button className="nav-item">
            <span>♙</span>
            Customers
          </button>

          <button className="nav-item">
            <span>□</span>
            Products
          </button>

          <button className="nav-item">
            <span>◫</span>
            Inventory
          </button>

          <button className="nav-item">
            <span>▤</span>
            Sales Challans
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-info">
            <div className="avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user.username}</strong>
              <span>{user.role}</span>
            </div>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p>Overview of your ERP operations</p>
          </div>

          <div className="role-badge">
            {user.role}
          </div>
        </header>

        <section className="dashboard-grid">
          <div className="stat-card">
            <span>Customers</span>
            <strong>—</strong>
            <small>Customer CRM</small>
          </div>

          <div className="stat-card">
            <span>Products</span>
            <strong>—</strong>
            <small>Product catalogue</small>
          </div>

          <div className="stat-card">
            <span>Inventory</span>
            <strong>—</strong>
            <small>Current stock</small>
          </div>

          <div className="stat-card">
            <span>Challans</span>
            <strong>—</strong>
            <small>Sales challans</small>
          </div>
        </section>

        <section className="welcome-card">
          <div>
            <h2>Welcome, {user.username} 👋</h2>
            <p>
              Use the navigation menu to manage customers, products,
              inventory and sales challans.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;