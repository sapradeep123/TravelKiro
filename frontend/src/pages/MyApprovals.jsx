import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MyApprovals = () => {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [filteredApprovals, setFilteredApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [workflowHistory, setWorkflowHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const accountId = user?.default_account_id || user?.accounts?.[0]?.id;

  useEffect(() => {
    if (accountId) {
      fetchApprovals();
    }
  }, [accountId]);

  useEffect(() => {
    filterApprovalsByStatus();
  }, [approvals, filterStatus]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/v2/dms/approvals/my-approvals', {
        headers: { 'X-Account-Id': accountId }
      });
      setApprovals(response.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('You do not have permission to view approvals');
      } else {
        setError('Failed to load approvals');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterApprovalsByStatus = () => {
    if (filterStatus === 'all') {
      setFilteredApprovals(approvals);
    } else {
      setFilteredApprovals(approvals.filter(a => a.status === filterStatus));
    }
  };

  const handleDecision = async (stepId, decision, comment = '') => {
    if (!window.confirm(`Are you sure you want to ${decision} this approval?`)) {
      return;
    }

    try {
      setProcessingId(stepId);
      await api.post(`/v2/dms/approvals/steps/${stepId}/decision`, {
        decision,
        comment
      }, {
        headers: { 'X-Account-Id': accountId }
      });
      
      setApprovals(prev => prev.map(approval => 
        approval.id === stepId 
          ? { ...approval, status: decision === 'approve' ? 'approved' : 'rejected' }
          : approval
      ));
      
      await fetchApprovals();
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to ${decision}`);
    } finally {
      setProcessingId(null);
    }
  };

  const fetchWorkflowHistory = async (workflowId) => {
    try {
      setLoadingHistory(true);
      const response = await api.get(`/v2/dms/approvals/workflows/${workflowId}`, {
        headers: { 'X-Account-Id': accountId }
      });
      setWorkflowHistory(response.data);
    } catch (err) {
      console.error('Failed to load workflow history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleViewHistory = (approval) => {
    setSelectedWorkflow(approval);
    fetchWorkflowHistory(approval.workflow_id);
  };

  const closeHistoryModal = () => {
    setSelectedWorkflow(null);
    setWorkflowHistory(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      skipped: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          Please log in to view approvals.
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
        <h1 className="text-2xl font-semibold text-gray-900">My Approvals</h1>
        <p className="text-gray-600 mt-1">Review and manage approval requests assigned to you</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-gray-200">
        {['pending', 'approved', 'rejected', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
              filterStatus === status
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex justify-between items-center">
          <span>{error}</span>
          <div className="flex space-x-2">
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">×</button>
            <button onClick={fetchApprovals} className="text-sm underline">Retry</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredApprovals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No {filterStatus !== 'all' ? filterStatus : ''} approvals
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filterStatus === 'pending' 
              ? "You don't have any pending approval requests."
              : `No ${filterStatus} approvals found.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApprovals.map((approval) => (
            <div key={approval.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(approval.status)}`}>
                  {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                </span>
                {approval.workflow?.mode === 'serial' && (
                  <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                    Step {approval.order_index + 1}
                  </span>
                )}
              </div>

              <h3 className="font-medium text-gray-900 mb-1">
                {approval.workflow?.file_name || 'File Approval Request'}
              </h3>

              {approval.workflow?.document_id && (
                <p className="text-xs text-gray-500 font-mono mb-2">{approval.workflow.document_id}</p>
              )}

              {approval.workflow?.resolution_text && (
                <p className="text-sm text-gray-600 mb-3">{approval.workflow.resolution_text}</p>
              )}

              <div className="text-xs text-gray-500 space-y-1 mb-4">
                <div>Assigned: {formatDate(approval.created_at)}</div>
                {approval.workflow?.mode && <div>Mode: {approval.workflow.mode}</div>}
                {approval.workflow?.initiator_username && (
                  <div>Requested by: {approval.workflow.initiator_username}</div>
                )}
              </div>

              <div className="space-y-2">
                {approval.workflow?.file_id && (
                  <Link
                    to={`/files/${approval.workflow.file_id}`}
                    className="block w-full text-center px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    View File
                  </Link>
                )}
                
                <button
                  onClick={() => handleViewHistory(approval)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  View History
                </button>

                {approval.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDecision(approval.id, 'approve')}
                      disabled={processingId === approval.id}
                      className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {processingId === approval.id ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => {
                        const comment = prompt('Rejection reason (optional):');
                        if (comment !== null) {
                          handleDecision(approval.id, 'reject', comment);
                        }
                      }}
                      disabled={processingId === approval.id}
                      className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {approval.acted_at && (
                  <p className="text-xs text-gray-500">Acted: {formatDate(approval.acted_at)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Approval History</h3>
              <button onClick={closeHistoryModal} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
              {loadingHistory ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : workflowHistory ? (
                <>
                  <div className="mb-6">
                    <h4 className="font-medium">{workflowHistory.file_name}</h4>
                    <p className="text-sm text-gray-500 font-mono">{workflowHistory.document_id}</p>
                    <div className="flex space-x-4 mt-2 text-sm text-gray-600">
                      <span>Mode: {workflowHistory.mode}</span>
                      <span className={`px-2 py-0.5 rounded ${getStatusBadge(workflowHistory.status)}`}>
                        {workflowHistory.status}
                      </span>
                    </div>
                    {workflowHistory.resolution_text && (
                      <p className="mt-2 text-sm text-gray-600">{workflowHistory.resolution_text}</p>
                    )}
                  </div>

                  <h5 className="font-medium mb-3">Approval Steps</h5>
                  <div className="space-y-3">
                    {workflowHistory.steps?.map((step) => (
                      <div key={step.id} className="border-l-2 border-gray-200 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {workflowHistory.mode === 'serial' && `Step ${step.order_index + 1}: `}
                              {step.approver_username}
                            </p>
                            <p className="text-sm text-gray-500">{step.approver_email}</p>
                          </div>
                          <span className={`px-2 py-0.5 text-xs rounded ${getStatusBadge(step.status)}`}>
                            {step.status}
                          </span>
                        </div>
                        {step.comment && (
                          <p className="mt-1 text-sm text-gray-600 italic">"{step.comment}"</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {step.acted_at ? formatDate(step.acted_at) : `Assigned: ${formatDate(step.created_at)}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Failed to load history</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={closeHistoryModal}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApprovals;
