import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const MyReminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  const accountId = user?.default_account_id || user?.accounts?.[0]?.id;

  useEffect(() => {
    if (accountId) {
      fetchReminders();
    }
  }, [accountId, filter]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = filter === 'due' ? { due: 'now' } : { due: 'all' };
      
      const response = await api.get('/v2/dms/reminders/me', {
        params,
        headers: { 'X-Account-Id': accountId }
      });
      setReminders(response.data || []);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view reminders');
      } else if (err.response?.status === 404) {
        // Endpoint not found - backend may need restart
        setReminders([]);
      } else {
        setError('Failed to load reminders. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (reminderId) => {
    try {
      await api.patch(`/v2/dms/reminders/${reminderId}`, 
        { status: 'dismissed' },
        { headers: { 'X-Account-Id': accountId } }
      );
      toast.success('Reminder dismissed');
      fetchReminders();
    } catch (err) {
      toast.error('Failed to dismiss reminder');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date - now;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMs < 0) {
      return { text: 'Overdue', className: 'text-red-600' };
    } else if (diffMins < 60) {
      return { text: `In ${diffMins} minutes`, className: 'text-yellow-600' };
    } else if (diffHours < 24) {
      return { text: `In ${diffHours} hours`, className: 'text-yellow-600' };
    } else if (diffDays < 7) {
      return { text: `In ${diffDays} days`, className: 'text-blue-600' };
    } else {
      return { text: date.toLocaleDateString(), className: 'text-gray-500' };
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      dismissed: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const isPastDue = (dateString) => new Date(dateString) < new Date();

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          Please log in to view reminders.
        </div>
      </div>
    );
  }

  if (!accountId) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          No account assigned. Please contact your administrator.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">My Reminders</h1>
        <p className="text-gray-600 mt-1">Track document reminders assigned to you</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
            filter === 'all'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          All Reminders
        </button>
        <button
          onClick={() => setFilter('due')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
            filter === 'due'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Due Now
          {filter === 'due' && reminders.length > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
              {reminders.length}
            </span>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex justify-between items-center">
          <span>{typeof error === 'string' ? error : 'An error occurred'}</span>
          <button onClick={fetchReminders} className="text-sm underline">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reminders</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'due' 
              ? "You don't have any due reminders."
              : "You don't have any reminders set."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reminders.map((reminder) => {
            const dueInfo = formatDate(reminder.remind_at);
            return (
              <div 
                key={reminder.id} 
                className={`bg-white rounded-lg shadow p-4 ${isPastDue(reminder.remind_at) ? 'border-l-4 border-red-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(reminder.status)}`}>
                    {reminder.status}
                  </span>
                  {isPastDue(reminder.remind_at) && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
                      Overdue
                    </span>
                  )}
                </div>

                <h3 className="font-medium text-gray-900 mb-1">
                  <Link to={`/files/${reminder.file_id}`} className="hover:text-blue-600">
                    {reminder.file_name || 'Document'}
                  </Link>
                </h3>

                <p className="text-sm text-gray-600 mb-3">{reminder.message}</p>

                <div className="text-xs text-gray-500 space-y-1 mb-4">
                  <div className={dueInfo.className}>
                    Due: {dueInfo.text}
                  </div>
                  {reminder.creator_username && (
                    <div>From: {reminder.creator_username}</div>
                  )}
                  {reminder.document_id && (
                    <div className="font-mono">{reminder.document_id}</div>
                  )}
                </div>

                {reminder.status === 'pending' && (
                  <div className="space-y-2">
                    <Link
                      to={`/files/${reminder.file_id}`}
                      className="block w-full text-center px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      View File
                    </Link>
                    <button
                      onClick={() => handleDismiss(reminder.id)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-3">
                  Created: {new Date(reminder.created_at).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyReminders;
