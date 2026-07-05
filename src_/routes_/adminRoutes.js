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
module.exports = router;


