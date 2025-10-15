import mongoose, { Schema, Document } from 'mongoose';

export interface ISellerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  shopName: string;
  address?: string;
  detailedAddress?: string;
  contactNumber?: string;
  governmentId1Front?: string;
  governmentId1Back?: string;
  governmentId2Front?: string;
  governmentId2Back?: string;
  transactionOptions?: string[];
  termsAccepted: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

const SellerProfileSchema = new Schema<ISellerProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  shopName: { type: String, required: true, trim: true },
  address: { type: String },
  detailedAddress: { type: String },
  contactNumber: { type: String },
  governmentId1Front: { type: String },
  governmentId1Back: { type: String },
  governmentId2Front: { type: String },
  governmentId2Back: { type: String },
  transactionOptions: [{ type: String }],
  termsAccepted: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model<ISellerProfile>('SellerProfile', SellerProfileSchema);


