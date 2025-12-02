import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { Upload, Download, RotateCcw, X, KeyRound, Copy, Check } from 'lucide-react';

const FileVersions = ({ fileId, accountId, currentFileHash }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);

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

  const copyHash = async (hash, id) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(id);
      toast.success('SHA-256 hash copied to clipboard');
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (err) {
      toast.error('Failed to copy hash');
    }
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
          <div className="space-y-4">
            {versions.map((version, index) => (
              <div 
                key={version.id} 
                className={`p-4 rounded-lg border ${
                  index === 0 ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`font-bold ${index === 0 ? 'text-green-700' : 'text-gray-900'}`}>
                        v{version.version_number}
                      </span>
                      {index === 0 && (
                        <span className="px-2 py-0.5 bg-green-600 text-white text-xs rounded-full font-medium">
                          CURRENT
                        </span>
                      )}
                      <span className="text-gray-500 text-sm">{formatDate(version.created_at)}</span>
                      <span className="text-gray-500 text-sm">• {formatSize(version.size_bytes)}</span>
                    </div>
                    
                    {version.comment && (
                      <p className="text-gray-600 text-sm mb-2">{version.comment}</p>
                    )}
                    
                    {/* SHA-256 Hash */}
                    <div className="flex items-center space-x-2 mt-2">
                      <KeyRound size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-500">SHA-256:</span>
                      <code className="text-xs font-mono bg-white px-2 py-1 rounded border text-gray-700">
                        {version.file_hash ? `${version.file_hash.substring(0, 16)}...${version.file_hash.substring(version.file_hash.length - 8)}` : 'N/A'}
                      </code>
                      {version.file_hash && (
                        <button
                          onClick={() => copyHash(version.file_hash, version.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Copy full hash"
                        >
                          {copiedHash === version.id ? (
                            <Check size={14} className="text-green-600" />
                          ) : (
                            <Copy size={14} className="text-gray-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      className="text-blue-600 hover:text-blue-700 p-2 rounded hover:bg-blue-100 flex items-center space-x-1 text-sm"
                      onClick={() => handleDownloadVersion(version.id, version.version_number)}
                      title="Download this version"
                    >
                      <Download size={16} />
                    </button>
                    {index !== 0 && (
                      <button
                        className="text-green-600 hover:text-green-700 p-2 rounded hover:bg-green-100 flex items-center space-x-1 text-sm"
                        onClick={() => handleRestoreVersion(version.id)}
                        title="Restore this version"
                      >
                        <RotateCcw size={16} />
                      </button>
                    )}
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

export default FileVersions;
