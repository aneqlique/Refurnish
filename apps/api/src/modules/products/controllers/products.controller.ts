import { Request, Response } from "express";
import cloudinary from "cloudinary";
import Product, { IProduct } from "../models/products.model";
import SiteVisit from "../../site-visits/models/site-visits.model";

declare global {
  namespace Express {
    interface Request {
      file?: any;
    }
  }
}

export const uploadProduct = async (req: Request, res: Response) => {
  try {
    const { title, description, price, condition, category, location, status } =
      req.body;
    const image = req.file;

    if (!image) {
      return res.status(400).json({ error: "Image file is required." });
    }

    if (status === "for_sale" && !price) {
      return res
        .status(400)
        .json({ error: "Price is required for a product for sale." });
    }

    const result = await cloudinary.v2.uploader.upload(image.path, {
      folder: "ecommerce-products",
      public_id: `${title.replace(/\s/g, "_")}-${new Date().getTime()}`,
    });

    const newProduct: IProduct = new Product({
      title,
      description,
      price: status === "for_sale" || status === "both" ? price : undefined,
      condition,
      category,
      location,
      images: [result.secure_url],
      owner: req.user._id,
      status,
    });

    await newProduct.save();

    res
      .status(201)
      .json({ message: "Product uploaded successfully!", product: newProduct });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload product" });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { status, search, category, location, listedAs } = req.query;
    const query: any = {};

    if (status && ["for_sale", "for_swap", "both", "listed"].includes(status as string)) {
      query.status = status;
    }
    if (listedAs && ["sale", "swap"].includes(listedAs as string)) {
      query.listedAs = listedAs;
    }
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (category) {
      query.category = category;
    }
    if (location) {
      query.location = location;
    }

    const products = await Product.find(query).populate("owner", "email");
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// --- Missing Controller Functions ---

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "owner",
      "firstName lastName email"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({
      message: "Product updated successfully!",
      product: updatedProduct,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};

// Get total sales from sold products
export const getTotalSales = async (req: Request, res: Response) => {
  try {
    const soldProducts = await Product.find({ status: "sold" });
    
    const totalSales = soldProducts.reduce((total, product) => {
      return total + (product.price || 0);
    }, 0);

    res.status(200).json({
      totalSales,
      soldProductsCount: soldProducts.length,
      message: "Total sales calculated successfully"
    });
  } catch (err) {
    console.error("Error calculating total sales:", err);
    res.status(500).json({ error: "Failed to calculate total sales" });
  }
};

// Get site earnings for the current month (5% commission on sold items)
export const getMonthlyEarnings = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Consider products sold this month; use updatedAt to reflect status change time
    const soldThisMonth = await Product.find({
      status: 'sold',
      updatedAt: { $gte: monthStart, $lte: monthEnd },
    });

    const grossSales = soldThisMonth.reduce((total, product) => total + (product.price || 0), 0);
    const commission = grossSales * 0.05;

    const monthLabel = monthStart.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    res.status(200).json({
      month: monthLabel,
      grossSales,
      commission,
      soldCount: soldThisMonth.length,
    });
  } catch (err) {
    console.error('Error calculating monthly earnings:', err);
    res.status(500).json({ error: 'Failed to calculate monthly earnings' });
  }
};

// Get weekly analytics for sales (sold products) and visits
// Get products for approval (admin only)
export const getProductsForApproval = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ status: "for_approval" })
      .populate("owner", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products for approval:", err);
    res.status(500).json({ error: "Failed to fetch products for approval" });
  }
};

// Approve or reject product (admin only)
export const moderateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // "approve" or "reject"

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ error: "Invalid action. Must be 'approve' or 'reject'" });
    }

    let updateData: any = {};
    
    if (action === "approve") {
      // Upon approval, mark as listed
      updateData.status = "listed";
    } else {
      // For reject, we could either delete or mark as rejected
      // For now, let's delete the product
      await Product.findByIdAndDelete(id);
      return res.status(200).json({ message: "Product rejected and removed" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({
      message: `Product ${action}d successfully`,
      product: updatedProduct,
    });
  } catch (err) {
    console.error("Error moderating product:", err);
    res.status(500).json({ error: "Failed to moderate product" });
  }
};

// Get weekly analytics for sales (sold products) and visits
export const getWeeklyAnalytics = async (req: Request, res: Response) => {
  try {
    // Accept optional startDate (ISO string); default to the Monday of current week
    const { startDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date();

    // Normalize to Monday 00:00:00
    const day = start.getDay(); // 0=Sun..6=Sat
    const diffToMonday = (day === 0 ? -6 : 1 - day); // move back to Monday
    const monday = new Date(start);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Build an array of day boundaries for mapping results to Mon..Sun
    const days: Date[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      d.setHours(0, 0, 0, 0);
      return d;
    });

    // Sales aggregation: sold products created or updated within range
    const salesAgg = await Product.aggregate([
      {
        $match: {
          status: 'sold',
          createdAt: { $gte: monday, $lte: sunday },
        },
      },
      {
        $group: {
          _id: {
            y: { $year: '$createdAt' },
            m: { $month: '$createdAt' },
            d: { $dayOfMonth: '$createdAt' },
          },
          totalSales: { $sum: { $ifNull: ['$price', 0] } },
          count: { $sum: 1 },
        },
      },
    ]);

    // Visits aggregation within range
    const visitsAgg = await SiteVisit.aggregate([
      { $match: { timestamp: { $gte: monday, $lte: sunday } } },
      {
        $group: {
          _id: {
            y: { $year: '$timestamp' },
            m: { $month: '$timestamp' },
            d: { $dayOfMonth: '$timestamp' },
          },
          visits: { $sum: 1 },
        },
      },
    ]);

    // Map aggregates into Mon..Sun arrays
    const formatKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const salesMap = new Map<string, { totalSales: number; count: number }>();
    for (const s of salesAgg) {
      const key = `${s._id.y}-${s._id.m}-${s._id.d}`;
      salesMap.set(key, { totalSales: s.totalSales, count: s.count });
    }
    const visitsMap = new Map<string, number>();
    for (const v of visitsAgg) {
      const key = `${v._id.y}-${v._id.m}-${v._id.d}`;
      visitsMap.set(key, v.visits);
    }

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const chartData = days.map((d, i) => {
      const key = formatKey(d);
      const sale = salesMap.get(key) || { totalSales: 0, count: 0 };
      const visits = visitsMap.get(key) || 0;
      return { name: dayNames[i], sales: sale.totalSales, visits };
    });

    const rangeLabel = `${monday.toLocaleDateString('en-US', { month: 'long' })} ${monday.getDate()} - ${sunday.toLocaleDateString('en-US', { month: 'long' })} ${sunday.getDate()}`;

    res.status(200).json({
      range: { start: monday, end: sunday, label: rangeLabel },
      data: chartData,
    });
  } catch (err) {
    console.error('Error building weekly analytics:', err);
    res.status(500).json({ error: 'Failed to build weekly analytics' });
  }
};