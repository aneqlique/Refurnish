import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.model";
import { io } from "../../../app";
import config from "../../../config/config";
import cloudinary from "cloudinary";

// Validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: "Password must be at least 6 characters long" };
  }
  return { isValid: true };
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const user = new User({ firstName, lastName, email, password, role: 'buyer' });
    await user.save();
    const token = user.generateAuthToken();
    
    res.status(201).json({ 
      token, 
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      message: "User registered successfully!" 
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "User already exists with this email" });
    }
    res.status(400).json({ error: err.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password, adminSecret } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Check if user has a password (not Google OAuth only)
    if (!user.password) {
      return res.status(400).json({ error: "Please use Google sign-in for this account" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Admin authentication check
    if (user.role === 'admin') {
      if (!adminSecret || adminSecret !== config.adminSecret) {
        return res.status(403).json({ error: "Admin access denied" });
      }
    }

    const token = user.generateAuthToken();
    res.json({ 
      token, 
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      message: "Logged in successfully!" 
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    console.log('Google Auth request received:', req.body);
    const { googleId, email, firstName, lastName, profilePicture } = req.body;

    // More lenient validation - only require googleId and email
    if (!googleId || !email) {
      console.log('Google Auth: Missing required fields', { googleId, email, firstName, lastName });
      return res.status(400).json({ error: "Google authentication data incomplete" });
    }

    // Use email as fallback for names if not provided
    const finalFirstName = firstName || email.split('@')[0];
    const finalLastName = lastName || '';

    // Check if user exists with Google ID
    let user = await User.findOne({ googleId });
    console.log('Google Auth: User found by googleId:', !!user);
    
    if (!user) {
      // Check if user exists with email but no Google ID
      user = await User.findOne({ email });
      console.log('Google Auth: User found by email:', !!user);
      
      if (user) {
        // Link Google account to existing user
        console.log('Google Auth: Linking Google account to existing user');
        user.googleId = googleId;
        // Only update profile picture if user doesn't have a custom one
        if (!user.profilePicture || user.profilePicture.includes('googleusercontent.com')) {
          user.profilePicture = profilePicture;
        }
        await user.save();
      } else {
        // Create new user
        console.log('Google Auth: Creating new user');
        user = new User({
          googleId,
          email,
          firstName: finalFirstName,
          lastName: finalLastName,
          profilePicture,
          isEmailVerified: true,
          role: 'buyer'
        });
        await user.save();
        console.log('Google Auth: New user created:', user._id);
      }
    } else {
      // Update existing user's profile picture only if they don't have a custom one
      if (!user.profilePicture || user.profilePicture.includes('googleusercontent.com')) {
        console.log('Google Auth: Updating profile picture for existing user');
        user.profilePicture = profilePicture;
        await user.save();
      }
    }

    const token = user.generateAuthToken();
    const responseData = { 
      token, 
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
      },
      message: "Google authentication successful!" 
    };
    
    console.log('Google Auth: Sending response:', responseData);
    res.json(responseData);
  } catch (err: any) {
    console.error('Google Auth error:', err);
    res.status(400).json({ error: err.message });
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, adminSecret } = req.body;

    // Check admin secret
    if (!adminSecret || adminSecret !== config.adminSecret) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const user = new User({ firstName, lastName, email, password, role: 'admin' });
    await user.save();
    const token = user.generateAuthToken();
    
    res.status(201).json({ 
      token, 
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      message: "Admin created successfully!" 
    });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "User already exists with this email" });
    }
    res.status(400).json({ error: err.message });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // The 'authMiddleware' has already attached the user's ID to the request object.
    const { _id: userId } = req.user;

    // Find the user by ID and exclude the password field for security.
    const user = await User.findById(userId).select("-password");

    // If the user is not found, return a 404 error.
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the user's profile data in the response.
    res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      isEmailVerified: user.isEmailVerified,
      contactNumber: (user as any).contactNumber,
      address: (user as any).address,
      birthday: (user as any).birthday,
      gender: (user as any).gender
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { _id: userId } = req.user;
    const { firstName, lastName, profilePicture, contactNumber, address, birthday, gender } = req.body as {
      firstName?: string;
      lastName?: string;
      profilePicture?: string;
      contactNumber?: string;
      address?: string;
      birthday?: string;
      gender?: 'male' | 'female' | 'other';
    };

    const updates: any = {};
    if (typeof firstName === 'string') updates.firstName = firstName;
    if (typeof lastName === 'string') updates.lastName = lastName;
    if (typeof profilePicture === 'string') updates.profilePicture = profilePicture;
    if (typeof contactNumber === 'string') updates.contactNumber = contactNumber;
    if (typeof address === 'string') updates.address = address;
    if (typeof birthday === 'string') updates.birthday = new Date(birthday);
    if (gender) updates.gender = gender;

    const updated = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: updated._id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        role: updated.role,
        profilePicture: updated.profilePicture,
      contactNumber: (updated as any).contactNumber,
      address: (updated as any).address,
      birthday: (updated as any).birthday,
      gender: (updated as any).gender,
      },
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
};

export const uploadProfilePicture = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder: 'refurnish-profile',
      public_id: `user_${(req as any).user._id}_${Date.now()}`,
      overwrite: true,
    });

    return res.status(200).json({ url: result.secure_url });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to upload profile picture' });
  }
};

// Admin: List users with pagination and optional search
export const listUsers = async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt((req.query.limit as string) || "10", 10), 1),
      100
    );
    const search = ((req.query.search as string) || "").trim();

    const filter: any = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("firstName lastName email role createdAt profilePicture")
        .lean(),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    const data = users.map((u: any) => ({
      _id: u._id,
      name: [u.firstName, u.lastName].filter(Boolean).join(" ").trim(),
      email: u.email,
      role: u.role,
      profilePicture: u.profilePicture,
      createdDate: u.createdAt,
    }));

    return res.status(200).json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Admin: Update a user's basic fields
export const adminUpdateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { firstName, lastName, email, role } = req.body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: 'buyer' | 'seller' | 'admin';
    };

    const updates: any = {};
    if (typeof firstName === 'string') updates.firstName = firstName;
    if (typeof lastName === 'string') updates.lastName = lastName;
    if (typeof email === 'string') {
      if (!validateEmail(email)) return res.status(400).json({ message: 'Invalid email format' });
      updates.email = email;
    }
    if (role) updates.role = role;

    const updated = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });

    // Notify listeners
    io.emit('user_updated', { id: updated._id });

    return res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: updated._id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update user' });
  }
};

// Admin: Delete a user after confirming admin password
export const adminDeleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { adminPassword } = req.body as { adminPassword: string };

    // Verify the requester is an admin and password matches
    const adminUser = await User.findById((req as any).user._id);
    if (!adminUser || adminUser.role !== 'admin' || !adminUser.password) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const ok = await bcrypt.compare(adminPassword, adminUser.password);
    if (!ok) return res.status(401).json({ message: 'Invalid admin password' });

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });

    // Notify listeners
    io.emit('user_deleted', { id });

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to delete user' });
  }
};

// Authenticated lookup by email (non-admin) - smart search with multiple results
export const lookupUserByEmail = async (req: Request, res: Response) => {
  try {
    const email = (req.query.email as string || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'email is required' });

    // First try exact match
    const exactUser = await User.findOne({ email }).select('_id firstName lastName email role profilePicture');
    if (exactUser) {
      return res.status(200).json([{
        id: exactUser._id,
        firstName: exactUser.firstName,
        lastName: exactUser.lastName,
        email: exactUser.email,
        role: exactUser.role,
        profilePicture: exactUser.profilePicture,
      }]);
    }

    // If no exact match, do smart search with partial matches
    const searchTerm = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex special chars
    const users = await User.find({
      $or: [
        { email: { $regex: searchTerm, $options: 'i' } },
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { $expr: { $regexMatch: { input: { $concat: ['$firstName', ' ', '$lastName'] }, regex: searchTerm, options: 'i' } } }
      ]
    })
    .select('_id firstName lastName email role profilePicture')
    .limit(5)
    .sort({ email: 1 });

    const results = users.map(user => ({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
    }));

    return res.status(200).json(results);
  } catch (e) {
    return res.status(500).json({ error: 'Lookup failed' });
  }
};

export const updateUserActivity = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    await User.findByIdAndUpdate(userId, { 
      lastActive: new Date(),
      isOnline: true 
    });
    return res.status(200).json({ message: 'Activity updated' });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to update activity' });
  }
};

export const getActiveUsers = async (req: Request, res: Response) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeUsers = await User.find({
      lastActive: { $gte: fiveMinutesAgo },
      isOnline: true
    }).select('_id firstName lastName email role profilePicture lastActive isOnline');
    
    return res.status(200).json(activeUsers);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch active users' });
  }
};