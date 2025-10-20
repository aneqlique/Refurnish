import { Request, Response } from 'express';
import TrackOrder from '../models/trackorder.model';
import Cart from '../../carts/models/cart.model';
import { v4 as uuidv4 } from 'uuid';

// Create a new order from cart items
export const placeOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { selectedItems, shippingAddress, notes } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!selectedItems || !Array.isArray(selectedItems) || selectedItems.length === 0) {
      return res.status(400).json({ error: 'Selected items are required' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Filter cart items to only include selected items
    const orderItems = cart.items.filter(item => 
      selectedItems.includes(item.productId)
    );

    if (orderItems.length === 0) {
      return res.status(400).json({ error: 'No valid items selected for order' });
    }

    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = 150; // Fixed shipping fee
    const totalAmount = subtotal + shippingFee;

    // Generate unique order ID
    const orderId = `ORD-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Create new order
    const newOrder = new TrackOrder({
      orderId,
      userId,
      items: orderItems,
      status: 'Preparing to Ship',
      totalAmount,
      shippingFee,
      paymentMethod: 'Cash on Delivery',
      deliveryMethod: 'LBC Express',
      shippingAddress,
      notes
    });

    await newOrder.save();

    // Remove ordered items from cart
    cart.items = cart.items.filter(item => 
      !selectedItems.includes(item.productId)
    );
    await cart.save();

    res.status(201).json({
      success: true,
      order: newOrder,
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Server error placing order' });
  }
};

// Get user's orders
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const orders = await TrackOrder.find({ userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json(orders);
  } catch (error) {
    console.error('Error getting user orders:', error);
    res.status(500).json({ error: 'Server error getting orders' });
  }
};

// Get specific order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const { orderId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const order = await TrackOrder.findOne({ orderId, userId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ error: 'Server error getting order' });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['Preparing to Ship', 'Shipped out', 'Out for Delivery', 'Delivered', 'To Rate', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await TrackOrder.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();

    res.json({
      success: true,
      order,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Server error updating order status' });
  }
};

// Get all orders (admin only)
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query: any = {};
    if (status) {
      query.status = status;
    }

    const orders = await TrackOrder.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .populate('userId', 'firstName lastName email')
      .select('-__v');

    const total = await TrackOrder.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Error getting all orders:', error);
    res.status(500).json({ error: 'Server error getting orders' });
  }
};

