import { Router } from 'express';
import {
  getAdminOverview,
  getSystemHealth,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  getAdminDonors,
  getAdminHospitals,
  getAdminRequests,
  getAdminCertificates,
} from '../controllers/adminController.js';
import { deleteDonor } from '../controllers/donorController.js';
import { deleteHospital } from '../controllers/hospitalController.js';
import { deleteBloodRequest } from '../controllers/bloodRequestController.js';
import { deleteDonationHistory } from '../controllers/donationHistoryController.js';

const router = Router();

router.get('/overview', getAdminOverview);
router.get('/stats', getAdminOverview);
router.get('/health', getSystemHealth);
router.get('/system-health', getSystemHealth);

router.route('/users')
  .get(getAdminUsers)
  .post(createAdminUser);

router.route('/users/:user_id')
  .put(updateAdminUser)
  .delete(deleteAdminUser);

router.route('/donors')
  .get(getAdminDonors);

router.route('/donors/:donor_id')
  .delete(deleteDonor);

router.route('/hospitals')
  .get(getAdminHospitals);

router.route('/hospitals/:hospital_id')
  .delete(deleteHospital);

router.route('/requests')
  .get(getAdminRequests);

router.route('/requests/:request_id')
  .delete(deleteBloodRequest);

router.route('/certificates')
  .get(getAdminCertificates);

router.route('/certificates/:id')
  .delete(deleteDonationHistory);

export default router;
