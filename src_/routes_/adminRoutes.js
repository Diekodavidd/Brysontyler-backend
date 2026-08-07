const express = require('express');
const router = express.Router();
const {
    getStats,
    getAllUsers,
    getAllContent,
    getPendingContent,
    approveContent,
    rejectContent,
    requestChanges,
    publishScheduledContent,
    approveCreator,
    rejectCreator,
    getPendingCreators,
    getAllCreators,
    getAllFans,
    getMemberships,
    deleteUser,
    getReviewedContent,
} = require("../controllers_/adminController");

const {
  getAllPayouts,
  getPayoutStats,
  approvePayout,
  declinePayout,
  processPayout,
  completePayout,getAdminReports,manualUpgradeMembership,
  getBankTransferReceipts,approveBankTransferReceipt,rejectBankTransferReceipt,
  createAdminLiveSession,
  getAdminLiveSessions,
  getCurrentAdminLive,
  getAdminLiveStats,
  endAdminLiveSession,
} = require("../controllers_/adminController");

const {
  getAdminLiveSessionById,
  joinAdminLiveSession,
  leaveAdminLiveSession,
} = require("../controllers_/adminController");

const auth = require('../middleware_/authMiddleware');
const role = require('../middleware_/roleMiddleware');

router.get('/stats', auth, role(['admin']), getStats);
router.get('/users', auth, role(['admin']), getAllUsers);
router.get('/content', auth, role(['admin']), getAllContent);


router.get("/content/pending", auth, role(["admin"]), getPendingContent);

router.patch("/content/:id/approve", auth, role(["admin"]), approveContent);

router.patch("/content/:id/reject", auth, role(["admin"]), rejectContent);

router.patch("/content/:id/request-changes", auth, role(["admin"]), requestChanges);

router.post("/content/publish", auth, role(["admin"]), publishScheduledContent);

router.patch(
    "/creators/:id/approve",
    auth,
    role(["admin"]),
    approveCreator
);



router.patch(
    "/creators/:id/reject",
    auth,
    role(["admin"]),
    rejectCreator
);

router.get(
  "/reports",
  auth,
  role(["admin"]),
  getAdminReports
);

router.get(
    "/creators/pending",
    auth,
    role(["admin"]),
    getPendingCreators
);




    router.get(
    "/fans",
    auth,
    role(["admin"]),
    getAllFans
);



router.get(
    "/creators",
    auth,
    role(["admin"]),
    getAllCreators
);



router.get(
    "/memberships",
 auth,
    role(["admin"]),
    getMemberships
);

router.delete(
  "/users/:id",
  (req, res, next) => {
    console.log("DELETE ROUTE HIT:", req.params.id);
    next();
  },
  auth,
  role(["admin"]),
  deleteUser
);

router.get(
  "/content/reviewed",
  auth,
  role(["admin"]),
  getReviewedContent
);

// ============================================================
// PAYOUTS
// ============================================================

router.get(
  "/payouts",
  auth,
  role(["admin"]),
  getAllPayouts
);

router.get(
  "/payouts/stats",
  auth,
  role(["admin"]),
  getPayoutStats
);

router.patch(
  "/payouts/:id/approve",
  auth,
  role(["admin"]),
  approvePayout
);

router.patch(
  "/payouts/:id/decline",
  auth,
  role(["admin"]),
  declinePayout
);

router.patch(
  "/payouts/:id/process",
  auth,
  role(["admin"]),
  processPayout
);

router.patch(
  "/payouts/:id/complete",
  auth,
  role(["admin"]),
  completePayout
);

router.patch(
  "/fans/:id/membership",
  auth,
  role(["admin"]),
  manualUpgradeMembership
);


router.get(
    "/payments/bank-transfer",
    auth,
  role(["admin"]),
    getBankTransferReceipts
);

router.patch(
    "/payments/bank-transfer/:id/approve",
    auth,
  role(["admin"]),
    approveBankTransferReceipt
);

router.patch(
    "/payments/bank-transfer/:id/reject",
    auth,
  role(["admin"]),
    rejectBankTransferReceipt
);

// =====================================
// ADMIN LIVE
// =====================================

router.get(
  "/live",
  auth,
  role(["admin"]),
  getAdminLiveSessions
);

router.get(
  "/live/current",
  auth,
  role(["admin"]),
  getCurrentAdminLive
);

router.get(
  "/live/stats",
  auth,
  role(["admin"]),
  getAdminLiveStats
);

router.post(
  "/live/create",
  auth,
  role(["admin"]),
  createAdminLiveSession
);

router.post(
  "/live/end/:id",
  auth,
  role(["admin"]),
  endAdminLiveSession
);

router.get(
  "/live/:id",
  auth,
  role(["admin"]),
  getAdminLiveSessionById
);

router.post(
  "/live/:id/join",
  auth,
  role(["admin"]),
  joinAdminLiveSession
);

router.post(
  "/live/:id/leave",
  auth,
  role(["admin"]),
  leaveAdminLiveSession
);
module.exports = router;


