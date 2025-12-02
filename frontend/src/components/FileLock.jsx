import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { Lock, Unlock, X, Info } from 'lucide-react';

const FileLock = ({ fileId, accountId }) => {
  const [lockStatus, setLockStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(6);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLockStatus();
  }, [fileId]);

  const fetchLockStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/v2/dms/files-dms/${fileId}/lock`, {
        headers: { 'X-Account-Id': accountId }
      });
      setLockStatus(response.data);
    } catch (err) {
      setError('Failed to load lock status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLock = async () => {
    try {
      await api.post(
        `/v2/dms/files-dms/${fileId}/lock?duration_hours=${duration}`,
        {},
        { headers: { 'X-Account-Id': accountId } }
      );
      toast.success('File locked');
      fetchLockStatus();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to lock file');
    }
  };

  const handleUnlock = async () => {
    try {
      await api.delete(`/v2/dms/files-dms/${fileId}/lock`, {
        headers: { 'X-Account-Id': accountId }
      });
      toast.success('File unlocked');
      fetchLockStatus();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to unlock file');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">File Lock Status</h3>
        
        {lockStatus?.is_locked ? (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-start space-x-3">
              <Lock size={20} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">File is Locked</p>
                <p className="text-sm mt-1">
                  Locked by: <span className="font-medium">{lockStatus.locked_by_username || lockStatus.locked_by}</span>
                </p>
                <p className="text-sm">
                  Until: <span className="font-medium">{formatDate(lockStatus.locked_until)}</span>
                </p>
              </div>
            </div>

            {lockStatus.can_unlock ? (
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                onClick={handleUnlock}
              >
                <Unlock size={18} />
                <span>Unlock File</span>
              </button>
            ) : (
              <div className="flex items-start space-x-2 text-gray-600">
                <Info size={18} className="mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  You cannot unlock this file. Only the lock owner or an administrator can unlock it.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start space-x-3">
              <Unlock size={20} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">File is Unlocked</p>
                <p className="text-sm mt-1">Anyone with permission can edit this file</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lock Duration (hours)
              </label>
              <select
                className="input-field"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="4">4 hours</option>
                <option value="6">6 hours</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
                <option value="72">72 hours</option>
              </select>
            </div>

            <button
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center space-x-2"
              onClick={handleLock}
            >
              <Lock size={18} />
              <span>Lock File</span>
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h4 className="font-medium text-gray-900 mb-2">About File Locking</h4>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Locking a file prevents others from uploading new versions or making changes</li>
          <li>The lock will automatically expire after the specified duration</li>
          <li>Only the lock owner or an administrator can unlock the file before expiration</li>
          <li>You can still view and download locked files</li>
        </ul>
      </div>
    </div>
  );
};

export default FileLock;
