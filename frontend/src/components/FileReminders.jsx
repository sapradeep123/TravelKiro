import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { Plus, X, Clock, Check, Trash2 } from 'lucide-react';

const FileReminders = ({ fileId, accountId }) => {
  const [reminders, setReminders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    target_user_id: '',
    remind_at: '',
    message: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReminders();
    fetchUsers();
  }, [fileId]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/v2/dms/files-dms/${fileId}/reminders`, {
        headers: { 'X-Account-Id': accountId }
      });
      setReminders(response.data);
    } catch (err) {
      setError('Failed to load reminders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/v2/rbac/users', {
        headers: { 'X-Account-Id': accountId }
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to load users', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        `/v2/dms/files-dms/${fileId}/reminders`,
        formData,
        { headers: { 'X-Account-Id': accountId } }
      );
      toast.success('Reminder created');
      setFormData({ target_user_id: '', remind_at: '', message: '' });
      setShowForm(false);
      fetchReminders();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create reminder');
    }
  };

  const handleDelete = async (reminderId) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) {
      return;
    }

    try {
      await api.delete(`/v2/dms/files-dms/reminders/${reminderId}`, {
        headers: { 'X-Account-Id': accountId }
      });
      toast.success('Reminder deleted');
      fetchReminders();
    } catch (err) {
      setError('Failed to delete reminder');
    }
  };

  const handleDismiss = async (reminderId) => {
    try {
      await api.patch(
        `/v2/dms/files-dms/reminders/${reminderId}`,
        { status: 'dismissed' },
        { headers: { 'X-Account-Id': accountId } }
      );
      toast.success('Reminder dismissed');
      fetchReminders();
    } catch (err) {
      setError('Failed to dismiss reminder');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      dismissed: 'bg-gray-100 text-gray-600'
    };
    return styles[status] || 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            <X size={18} />
          </button>
        </div>
      )}

      {/* Add Reminder Button */}
      <button
        className="btn-primary flex items-center space-x-2"
        onClick={() => setShowForm(!showForm)}
      >
        <Plus size={18} />
        <span>{showForm ? 'Cancel' : 'Add Reminder'}</span>
      </button>

      {/* Add Reminder Form */}
      {showForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Reminder</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remind User</label>
              <select
                className="input-field"
                value={formData.target_user_id}
                onChange={(e) => setFormData({ ...formData, target_user_id: e.target.value })}
                required
              >
                <option value="">Select user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remind At</label>
              <input
                type="datetime-local"
                className="input-field"
                value={formData.remind_at}
                onChange={(e) => setFormData({ ...formData, remind_at: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                className="input-field"
                rows="3"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="e.g., Please review this document"
                maxLength="500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">{formData.message.length}/500 characters</p>
            </div>

            <button type="submit" className="btn-primary">
              Create Reminder
            </button>
          </form>
        </div>
      )}

      {/* Reminders List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reminders</h3>
        {reminders.length === 0 ? (
          <p className="text-gray-500">No reminders set for this file</p>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(reminder.status)}`}>
                        {reminder.status}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{formatDate(reminder.remind_at)}</span>
                      </span>
                    </div>
                    <p className="text-gray-900 mb-2">{reminder.message}</p>
                    <p className="text-sm text-gray-500">
                      Created: {formatDate(reminder.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {reminder.status === 'pending' && (
                      <button
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                        onClick={() => handleDismiss(reminder.id)}
                        title="Dismiss"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    <button
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                      onClick={() => handleDelete(reminder.id)}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileReminders;
