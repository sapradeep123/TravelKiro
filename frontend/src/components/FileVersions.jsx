import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

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

  if (loading) return <div className="text-center py-4">Loading versions...</div>;

  return (
    <div className="file-versions">
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Upload New Version */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Upload New Version</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleUploadVersion}>
            <div className="mb-3">
              <label className="form-label">Select File</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                disabled={uploading}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Version Comment (Optional)</label>
              <input
                type="text"
                className="form-control"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g., Fixed typos, Updated content"
                disabled={uploading}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Version'}
            </button>
          </form>
        </div>
      </div>

      {/* Version List */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Version History</h5>
        </div>
        <div className="card-body">
          {versions.length === 0 ? (
            <p className="text-muted">No versions available</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Version</th>
                    <th>Date</th>
                    <th>Size</th>
                    <th>Comment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {versions.map((version) => (
                    <tr key={version.id}>
                      <td>
                        <strong>v{version.version_number}</strong>
                      </td>
                      <td>{formatDate(version.created_at)}</td>
                      <td>{formatSize(version.size_bytes)}</td>
                      <td>{version.comment || <span className="text-muted">-</span>}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleDownloadVersion(version.id, version.version_number)}
                        >
                          Download
                        </button>
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleRestoreVersion(version.id)}
                        >
                          Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileVersions;
