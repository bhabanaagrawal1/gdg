import express from "express";
import {
  userCreate,
  addFriends,
  scoreCalculator,
  report,
  editProfile,
  addFriendsByPhone,
  getReports,
} from "../controllers/user.js";
// bug: decodeToken was used but never imported
import { decodeToken } from "../middleware/auth.js";
const router = express.Router();

router.post("/user", decodeToken, userCreate);
router.patch("/addfriends", decodeToken, addFriends);
router.get("/safeScore", decodeToken, scoreCalculator);
router.post("/report", decodeToken, report);
router.get("/reports", getReports); // Public or protected? Let's make it open for map
router.patch("/profile", decodeToken, editProfile);

router.post("/friends/phone", decodeToken, addFriendsByPhone);

router.post("/friends", decodeToken, addFriends);

export default router;
