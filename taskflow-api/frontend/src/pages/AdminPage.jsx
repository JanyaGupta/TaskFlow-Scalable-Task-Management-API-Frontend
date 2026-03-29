import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '../services/api';
import Sidebar from '../components/Sidebar';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({ page: 1, limit: 10, role: '' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page: filters.page, limit: filters.limit };
      if (filters.role) params.role = filters.role;
      const data = await usersApi.getAll(params);
      if (data.success) {
        setUsers(data.data);
        setPagination(data.pagination || { total: 0, page: 1, totalPages: 1 });
      } else {
        setError(data.message || 'Failed to load users');
      }
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleRoleChange = async (id, role) => {
    const data = await usersApi.updateRole(id, role);
    if (data.success) {
      showSuccess('Role updated');
      fetchUsers();
    } else {
      setError(data.message || 'Failed to update role');
    }
  };

  const handleDeactivate = async (id) => {
    const data = await usersApi.deactivate(id);
    if (data.success) {
      showSuccess('User deactivated');
      fetchUsers();
    } else {
      setError(data.message || 'Failed to deactivate user');
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <div>
            <h1 className="page-title">Admin Panel</h1>
            <p className="page-subtitle">Manage users and roles · {pagination.total} total users</p>
          </div>
        </div>

        <div className="page-content">
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{pagination.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Admins</div>
              <div className="stat-value" style={{ color: 'var(--accent-2)' }}>
                {users.filter((u) => u.role === 'admin').length}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active</div>
              <div className="stat-value" style={{ color: 'var(--green)' }}>
                {users.filter((u) => u.isActive).length}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-row" style={{ marginBottom: 16 }}>
            <select
              className="filter-select"
              value={filters.role}
              onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value, page: 1 }))}
            >
              <option value="">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {error && <div className="alert alert-error">⚠ {error}</div>}
          {success && <div className="alert alert-success">✓ {success}</div>}

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
              <div className="spinner" />
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)' }}>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-in-progress' : 'badge-todo'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.isActive ? 'badge-done' : 'badge-high'}`}>
                          {u.isActive ? 'active' : 'inactive'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleRoleChange(u._id, u.role === 'admin' ? 'user' : 'admin')}
                            title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                          >
                            {u.role === 'admin' ? '↓ Demote' : '↑ Admin'}
                          </button>
                          {u.isActive && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeactivate(u._id)}
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={pagination.page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
              >← Prev</button>
              <span className="page-info">Page {pagination.page} of {pagination.totalPages}</span>
              <button
                className="page-btn"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              >Next →</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
