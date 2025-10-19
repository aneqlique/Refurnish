import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  price?: number; // Optional if the product is for swap
  quantity: number;
  condition: string;
  category: string;
  images: string[];
  location: string;
  owner: mongoose.Schema.Types.ObjectId;
  status: "for_sale" | "for_swap" | "both" | "sold" | "for_approval" | "listed"; // Added listed status
  material: "wood" | "plastic" | "steel";
  age: {
    value: number;
    unit: "years" | "months" | "days";
  };
  listedAs: "sale" | "swap" | "both";
  mode_of_payment: "cash" | "bank" | "gcash/maya";
  courier: "J&T Express" | "Lalamove" | "LBC Express";
  swapWantedCategory?: string;
  swapWantedDescription?: string;
}

const ProductSchema: Schema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: false }, // Made optional
  quantity: { type: Number, required: true, min: 1 },
  condition: { type: String, required: true },
  category: { type: String, required: true },
  images: { type: [String], required: true },
  location: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    required: true,
    enum: ["for_sale", "for_swap", "both", "sold", "for_approval", "listed"],
  },
  material: {
    type: String,
    required: true,
    enum: ["wood", "plastic", "steel"],
  },
  age: {
    value: { type: Number, required: true },
    unit: { type: String, required: true, enum: ["years", "months", "days"] },
  },
  listedAs: {
    type: String,
    required: true,
    enum: ["sale", "swap", "both"],
  },
  mode_of_payment: {
    type: String,
    required: true,
    enum: ["cash", "bank", "gcash/maya"],
  },
  courier: {
    type: String,
    required: true,
    enum: ["J&T Express", "Lalamove", "LBC Express"],
  },
  swapWantedCategory: { type: String, required: false },
  swapWantedDescription: { type: String, required: false },
}, {
  timestamps: true
});

export default mongoose.model<IProduct>("Product", ProductSchema);
