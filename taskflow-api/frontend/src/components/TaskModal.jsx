import { useState, useEffect } from 'react';

const EMPTY = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', tags: '' };

export default function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
        tags: (task.tags || []).join(', '),
      });
    }
  }, [task]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        status: form.status,
        priority: form.priority,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      if (form.dueDate) payload.dueDate = form.dueDate;
      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">{task ? 'Edit Task' : 'New Task'}</h2>
        <p className="modal-subtitle">
          {task ? 'Update task details below' : 'Fill in the details for your new task'}
        </p>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className="form-input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Task title"
              required
              minLength={3}
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional description…"
              rows={3}
              maxLength={1000}
              style={{ resize: 'vertical', minHeight: 76 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" name="status" value={form.status} onChange={handleChange}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              className="form-input"
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Tags{' '}
              <span className="text-muted" style={{ textTransform: 'none', letterSpacing: 0 }}>
                — comma-separated
              </span>
            </label>
            <input
              className="form-input"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="design, backend, urgent"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
