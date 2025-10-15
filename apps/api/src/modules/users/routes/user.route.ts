import { Router } from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  googleAuth,
  createAdmin,
  listUsers,
  adminUpdateUser,
  adminDeleteUser,
  uploadProfilePicture,
  lookupUserByEmail,
  updateUserActivity,
  getActiveUsers,
} from "../controllers/user.controller";
import authMiddleware from "../../../middleware/auth";
import adminAuth from "../../../middleware/adminAuth";
import multer from "multer";

const userRoutes = Router();
const upload = multer({ dest: "uploads/" });

userRoutes.post("/register", registerUser);
userRoutes.post("/login", loginUser);
userRoutes.post("/google-auth", googleAuth);
userRoutes.post("/create-admin", createAdmin);
userRoutes.get("/profile", authMiddleware, getProfile);
userRoutes.put("/profile", authMiddleware, updateProfile);
userRoutes.post("/profile/avatar", authMiddleware, upload.single('avatar'), uploadProfilePicture);
// Lookup user by email (for starting conversations)
userRoutes.get('/lookup', authMiddleware, lookupUserByEmail);

// Update user activity
userRoutes.post('/activity', authMiddleware, updateUserActivity);

// Admin-only list users
userRoutes.get("/", authMiddleware, adminAuth, listUsers);

// Admin-only get active users
userRoutes.get("/active", authMiddleware, adminAuth, getActiveUsers);

// Admin: update user
userRoutes.put("/:id", authMiddleware, adminAuth, adminUpdateUser);

// Admin: delete user (requires admin password)
userRoutes.delete("/:id", authMiddleware, adminAuth, adminDeleteUser);

export default userRoutes;
