import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { Upload, Download, RotateCcw, X } from 'lucide-react';

const FileVersions = ({ fileId, accountId }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (fileId && accountId) {
      fetchVersions();
    }
  }, [fileId, accountId]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/v2/dms/files-dms/${fileId}/versions`, {
        headers: { 'X-Account-Id': accountId }
      });
      setVersions(response.data);
    } catch (err) {
      setError('Failed to load versions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadVersion = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      await api.post(
        `/v2/dms/files-dms/${fileId}/versions?comment=${encodeURIComponent(comment)}`,
        formData,
        {
          headers: {
            'X-Account-Id': accountId,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSelectedFile(null);
      setComment('');
      toast.success('Version uploaded');
      fetchVersions();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to upload version');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadVersion = async (versionId, versionNumber) => {
    try {
      const response = await api.get(
        `/v2/dms/files-dms/${fileId}/versions/${versionId}/download`,
        {
          headers: { 'X-Account-Id': accountId },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `version_${versionNumber}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Download started');
    } catch (err) {
      toast.error('Failed to download version');
    }
  };

  const handleRestoreVersion = async (versionId) => {
    if (!window.confirm('Are you sure you want to restore this version as current?')) {
      return;
    }

    try {
      await api.post(
        `/v2/dms/files-dms/${fileId}/versions/${versionId}/restore`,
        {},
        { headers: { 'X-Account-Id': accountId } }
      );
      toast.success('Version restored');
      fetchVersions();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to restore version');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
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

      {/* Upload New Version */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload New Version</h3>
        <form onSubmit={handleUploadVersion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
            <input
              type="file"
              className="input-field"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              disabled={uploading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Version Comment (Optional)
            </label>
            <input
              type="text"
              className="input-field"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g., Fixed typos, Updated content"
              disabled={uploading}
            />
          </div>
          <button
            type="submit"
            className="btn-primary flex items-center space-x-2"
            disabled={!selectedFile || uploading}
          >
            <Upload size={18} />
            <span>{uploading ? 'Uploading...' : 'Upload Version'}</span>
          </button>
        </form>
      </div>

      {/* Version List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Version History</h3>
        {versions.length === 0 ? (
          <p className="text-gray-500">No versions available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Version</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Size</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Comment</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((version) => (
                  <tr key={version.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900">v{version.version_number}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{formatDate(version.created_at)}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{formatSize(version.size_bytes)}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {version.comment || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 flex items-center space-x-1 text-sm"
                          onClick={() => handleDownloadVersion(version.id, version.version_number)}
                        >
                          <Download size={16} />
                          <span>Download</span>
                        </button>
                        <button
                          className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-50 flex items-center space-x-1 text-sm"
                          onClick={() => handleRestoreVersion(version.id)}
                        >
                          <RotateCcw size={16} />
                          <span>Restore</span>
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
    </div>
  );
};

export default FileVersions;
