import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { Edit2, Save, X, RefreshCw } from 'lucide-react';

const FileMetadata = ({ fileId, accountId, sectionId }) => {
  const [definitions, setDefinitions] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (fileId && accountId) {
      loadData();
    }
  }, [fileId, accountId, sectionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Build URL with optional section_id filter
      let defsUrl = '/v2/dms/metadata-dms/definitions';
      if (sectionId) {
        defsUrl += `?section_id=${sectionId}`;
      }
      
      const [defsRes, valuesRes] = await Promise.all([
        api.get(defsUrl, {
          headers: { 'X-Account-Id': accountId }
        }),
        api.get(`/v2/dms/metadata-dms/files/${fileId}`, {
          headers: { 'X-Account-Id': accountId }
        })
      ]);
      
      setDefinitions(defsRes.data || []);
      
      // Convert values array to object keyed by definition_id
      const valuesMap = {};
      (valuesRes.data || []).forEach(v => {
        valuesMap[v.definition_id] = v.value;
      });
      setValues(valuesMap);
    } catch (error) {
      console.error('Failed to load metadata:', error);
      toast.error('Failed to load metadata');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleValueChange = (defId, value) => {
    setValues(prev => ({ ...prev, [defId]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const metadata = Object.entries(values)
        .filter(([_, v]) => v !== undefined && v !== '')
        .map(([definition_id, value]) => ({ definition_id, value }));
      
      await api.put(`/v2/dms/metadata-dms/files/${fileId}`, { metadata }, {
        headers: { 'X-Account-Id': accountId }
      });
      
      toast.success('Metadata saved');
      setEditMode(false);
    } catch (error) {
      const detail = error.response?.data?.detail;
      let errorMsg = 'Failed to save metadata';
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail)) {
        errorMsg = detail.map(d => d.msg || d.message || JSON.stringify(d)).join(', ');
      } else if (detail && typeof detail === 'object') {
        errorMsg = detail.msg || detail.message || JSON.stringify(detail);
      }
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const renderField = (def) => {
    const value = values[def.id] ?? '';
    const isDisabled = !editMode;
    const baseInputClass = `input-field ${isDisabled ? 'bg-gray-50 cursor-not-allowed' : ''}`;

    switch (def.field_type) {
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleValueChange(def.id, e.target.checked)}
            disabled={isDisabled}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleValueChange(def.id, e.target.value ? Number(e.target.value) : '')}
            disabled={isDisabled}
            className={baseInputClass}
          />
        );
      case 'date':
        return (
          <input
            type="date"
            value={value ? value.split('T')[0] : ''}
            onChange={(e) => handleValueChange(def.id, e.target.value)}
            disabled={isDisabled}
            className={baseInputClass}
          />
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleValueChange(def.id, e.target.value)}
            disabled={isDisabled}
            className={baseInputClass}
          >
            <option value="">-- Select --</option>
            {(def.options || []).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'multiselect':
        return (
          <select
            multiple
            value={Array.isArray(value) ? value : []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, o => o.value);
              handleValueChange(def.id, selected);
            }}
            disabled={isDisabled}
            className={`${baseInputClass} min-h-[80px]`}
          >
            {(def.options || []).map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      default: // text
        return (
          <input
            type="text"
            value={typeof value === 'object' ? JSON.stringify(value) : value}
            onChange={(e) => handleValueChange(def.id, e.target.value)}
            disabled={isDisabled}
            className={baseInputClass}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (definitions.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Metadata</h3>
        <p className="text-gray-500">No metadata fields defined for this section.</p>
        <p className="text-sm text-gray-400 mt-2">
          Go to <span className="font-medium">Metadata</span> in the admin menu to create custom fields.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Custom Metadata</h3>
        <div className="flex items-center space-x-2">
          {!editMode ? (
            <>
              <button 
                className="btn-secondary flex items-center space-x-2 text-sm"
                onClick={handleRefresh}
                title="Refresh metadata"
              >
                <RefreshCw size={16} />
              </button>
              <button 
                className="btn-secondary flex items-center space-x-2 text-sm"
                onClick={() => setEditMode(true)}
              >
                <Edit2 size={16} />
                <span>Edit</span>
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn-primary flex items-center space-x-2 text-sm"
                onClick={handleSave} 
                disabled={saving}
              >
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
              <button 
                className="btn-secondary flex items-center space-x-2 text-sm"
                onClick={() => { setEditMode(false); loadData(); }}
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {definitions.map(def => (
          <div key={def.id}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {def.label}
              {def.is_required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(def)}
            {def.description && (
              <p className="text-sm text-gray-500 mt-1">{def.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileMetadata;
