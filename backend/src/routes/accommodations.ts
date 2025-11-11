import { Router } from 'express';
import accommodationController from '../controllers/accommodationController';
import callRequestController from '../controllers/callRequestController';
import reportingController from '../controllers/reportingController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes (no authentication required)
router.get('/', accommodationController.getAllAccommodations);
router.get('/search', accommodationController.searchAccommodations);
router.get('/nearby', accommodationController.getNearbyAccommodations);
router.get('/slug/:slug', accommodationController.getAccommodationBySlug);
router.get('/:id', accommodationController.getAccommodationById);

// Public route - Request a call (with rate limiting in production)
router.post('/:id/request-call', callRequestController.createCallRequest);

// Admin routes (authentication required)
router.post('/', authenticate, accommodationController.createAccommodation);
router.put('/:id', authenticate, accommodationController.updateAccommodation);
router.delete('/:id', authenticate, accommodationController.deleteAccommodation);
router.patch('/:id/approval-status', authenticate, accommodationController.updateApprovalStatus);
router.patch('/:id/active-status', authenticate, accommodationController.toggleActiveStatus);

// Admin - Get all accommodations (including pending/rejected)
router.get('/admin/all', authenticate, accommodationController.getAdminAccommodations);

// Admin - Call request management
router.get('/admin/call-requests', authenticate, callRequestController.getAllCallRequests);
router.get('/admin/call-requests/scheduled', authenticate, callRequestController.getScheduledCallbacks);
router.get('/admin/call-requests/overdue', authenticate, callRequestController.getOverdueCallbacks);
router.get('/admin/call-requests/:id', authenticate, callRequestController.getCallRequestById);
router.post('/admin/call-requests/:id/assign', authenticate, callRequestController.assignCallRequest);
router.patch('/admin/call-requests/:id/status', authenticate, callRequestController.updateCallStatus);
router.patch('/admin/call-requests/:id/priority', authenticate, callRequestController.updatePriority);
router.post('/admin/call-requests/:id/interactions', authenticate, callRequestController.addInteraction);
router.post('/admin/call-requests/:id/schedule', authenticate, callRequestController.scheduleCallback);

// Admin - Reports
router.get('/admin/reports/lead-metrics', authenticate, reportingController.getLeadMetrics);
router.get('/admin/reports/conversion-funnel', authenticate, reportingController.getConversionFunnel);
router.get('/admin/reports/admin-performance', authenticate, reportingController.getAdminPerformance);
router.get('/admin/reports/property-performance', authenticate, reportingController.getPropertyPerformance);
router.get('/admin/reports/time-based', authenticate, reportingController.getTimeBasedReport);
router.get('/admin/reports/lost-lead-reasons', authenticate, reportingController.getLostLeadReasons);

export default router;
