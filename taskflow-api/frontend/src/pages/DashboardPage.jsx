import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksApi } from '../services/api';
import Sidebar from '../components/Sidebar';
import TaskModal from '../components/TaskModal';

const statusLabel = { 'todo': 'To Do', 'in-progress': 'In Progress', 'done': 'Done' };
const statusClass = { 'todo': 'badge-todo', 'in-progress': 'badge-in-progress', 'done': 'badge-done' };
const priorityClass = { low: 'badge-low', medium: 'badge-medium', high: 'badge-high' };

export default function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', page: 1, limit: 10 });
  const [modal, setModal] = useState({ open: false, task: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      params.page = filters.page;
      params.limit = filters.limit;

      const data = await tasksApi.getAll(params);
      if (data.success) {
        setTasks(data.data);
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      } else {
        setError(data.message || 'Failed to load tasks');
      }
    } catch {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSave = async (payload) => {
    if (modal.task) {
      const data = await tasksApi.update(modal.task._id, payload);
      if (!data.success) throw new Error(data.message);
      showSuccess('Task updated!');
    } else {
      const data = await tasksApi.create(payload);
      if (!data.success) throw new Error(data.message);
      showSuccess('Task created!');
    }
    fetchTasks();
  };

  const handleDelete = async (id) => {
    await tasksApi.delete(id);
    setDeleteConfirm(null);
    showSuccess('Task deleted.');
    fetchTasks();
  };

  const totalByStatus = (status) => tasks.filter((t) => t.status === status).length;

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <div>
            <h1 className="page-title">My Tasks</h1>
            <p className="page-subtitle">Welcome back, {user?.name} · {pagination.total} total tasks</p>
          </div>
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setModal({ open: true, task: null })}>
            + New Task
          </button>
        </div>

        <div className="page-content">
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total</div>
              <div className="stat-value">{pagination.total}</div>
              <div className="stat-sub">all tasks</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">To Do</div>
              <div className="stat-value" style={{ color: 'var(--text-2)' }}>{totalByStatus('todo')}</div>
              <div className="stat-sub">not started</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">In Progress</div>
              <div className="stat-value" style={{ color: 'var(--blue)' }}>{totalByStatus('in-progress')}</div>
              <div className="stat-sub">active</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Done</div>
              <div className="stat-value" style={{ color: 'var(--green)' }}>{totalByStatus('done')}</div>
              <div className="stat-sub">completed</div>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-row">
            <select
              className="filter-select"
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
            >
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <select
              className="filter-select"
              value={filters.priority}
              onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value, page: 1 }))}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <select
              className="filter-select"
              value={filters.limit}
              onChange={(e) => setFilters((f) => ({ ...f, limit: +e.target.value, page: 1 }))}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
          </div>

          {/* Alerts */}
          {error && <div className="alert alert-error">⚠ {error}</div>}
          {success && <div className="alert alert-success">✓ {success}</div>}

          {/* Task List */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
              <div className="spinner" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-title">No tasks found</div>
              <div className="empty-desc">Create your first task to get started</div>
            </div>
          ) : (
            <div className="tasks-grid">
              {tasks.map((task) => (
                <div key={task._id} className="task-card">
                  <div className="task-card-top">
                    <div className="task-title">{task.title}</div>
                    <div className="task-actions">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setModal({ open: true, task })}
                        title="Edit"
                      >✎</button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteConfirm(task)}
                        title="Delete"
                      >✕</button>
                    </div>
                  </div>
                  {task.description && <p className="task-desc">{task.description}</p>}
                  <div className="task-meta">
                    <span className={`badge ${statusClass[task.status]}`}>{statusLabel[task.status]}</span>
                    <span className={`badge ${priorityClass[task.priority]}`}>{task.priority}</span>
                    {(task.tags || []).map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                    {task.dueDate && (
                      <span className="task-date">due {new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
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

      {/* Task Modal */}
      {modal.open && (
        <TaskModal
          task={modal.task}
          onSave={handleSave}
          onClose={() => setModal({ open: false, task: null })}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 400 }}>
            <h2 className="modal-title">Delete Task?</h2>
            <p className="modal-subtitle" style={{ marginBottom: 8 }}>
              "<strong>{deleteConfirm.title}</strong>" will be permanently deleted.
            </p>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
