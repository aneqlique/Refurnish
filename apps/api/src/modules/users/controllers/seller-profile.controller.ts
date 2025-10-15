import { Request, Response } from 'express';
import SellerProfile from '../models/seller-profile.model';
import User from '../models/user.model';
import cloudinary from 'cloudinary';

export const getMySellerProfile = async (req: Request, res: Response) => {
  try {
    const profile = await SellerProfile.findOne({ userId: (req as any).user._id });
    if (!profile) return res.status(404).json({ message: 'No seller profile' });
    return res.status(200).json(profile);
  } catch (e: any) {
    return res.status(500).json({ message: 'Failed to fetch seller profile' });
  }
};

export const upsertMySellerProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const data = req.body;
    const existing = await SellerProfile.findOne({ userId });
    if (existing && existing.status !== 'rejected') {
      return res.status(409).json({ message: 'Seller profile already submitted', profile: existing });
    }
    const profile = await SellerProfile.findOneAndUpdate(
      { userId },
      { ...data, userId, status: 'pending' },
      { new: true, upsert: true }
    );
    return res.status(200).json({ message: 'Seller profile submitted', profile });
  } catch (e: any) {
    return res.status(500).json({ message: 'Failed to submit seller profile' });
  }
};

export const approveSeller = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // seller profile id
    const profile = await SellerProfile.findByIdAndUpdate(id, { status: 'approved' }, { new: true });
    if (!profile) return res.status(404).json({ message: 'Seller profile not found' });
    await User.findByIdAndUpdate(profile.userId, { role: 'seller' });
    return res.status(200).json({ message: 'Seller approved', profile });
  } catch (e: any) {
    return res.status(500).json({ message: 'Failed to approve seller' });
  }
};

export const uploadSellerDocument = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder: 'refurnish-seller-docs',
      public_id: `seller_${(req as any).user._id}_${Date.now()}`,
      overwrite: true,
    });
    return res.status(200).json({ url: result.secure_url });
  } catch (e: any) {
    return res.status(500).json({ message: 'Failed to upload document' });
  }
};

export const getAllSellerProfiles = async (req: Request, res: Response) => {
  try {
    const profiles = await SellerProfile.find()
      .populate('userId', 'firstName lastName email profilePicture role')
      .sort({ createdAt: -1 });
    return res.status(200).json(profiles);
  } catch (e: any) {
    return res.status(500).json({ message: 'Failed to fetch seller profiles' });
  }
};

export const rejectSeller = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await SellerProfile.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
    if (!profile) return res.status(404).json({ message: 'Seller profile not found' });
    return res.status(200).json({ message: 'Seller rejected', profile });
  } catch (e: any) {
    return res.status(500).json({ message: 'Failed to reject seller' });
  }
};


