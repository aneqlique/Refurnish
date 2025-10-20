"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PaymentMockupModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  provider: string;
  txnId?: string;
  onSuccess: (payload: { status: "SOLD"; txnId: string; amount: number }) => void;
}

const currency = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
});

export default function PaymentMockupModal({
  open,
  onClose,
  amount,
  provider,
  txnId,
  onSuccess,
}: PaymentMockupModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (open) {
      setCountdown(10);
      setIsProcessing(false);
    }
  }, [open]);

  useEffect(() => {
    if (countdown > 0 && !isProcessing) {
      const timer = setTimeout(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, isProcessing, onClose]);

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      onSuccess({
        status: "SOLD",
        txnId: txnId || `txn_${Date.now()}`,
        amount,
      });
    }, 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" style={{ fontFamily: 'Fustat, Arial, Helvetica, sans-serif' }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            {provider === 'gcash' ? (
              <Image src="/icon/GCash_logo.png" alt="GCash" width={40} height={40} className="object-contain" />
            ) : provider === 'paymaya' ? (
              <Image src="/icon/maya.jpg" alt="PayMaya" width={40} height={40} className="object-contain" />
            ) : (
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            )}
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {provider === 'gcash' ? 'GCash Payment' : provider === 'paymaya' ? 'PayMaya Payment' : 'Payment'}
          </h3>
          
          <p className="text-gray-600 mb-4">
            {provider === 'gcash' 
              ? 'You will be redirected to GCash to complete your payment.' 
              : provider === 'paymaya' 
              ? 'You will be redirected to PayMaya to complete your payment.'
              : 'Complete your payment to proceed with the order.'
            }
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Transaction ID:</span>
              <span className="text-sm font-mono text-gray-800">{txnId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Amount:</span>
              <span className="text-lg font-bold text-green-600">{currency.format(amount)}</span>
            </div>
          </div>

          {isProcessing ? (
            <div className="space-y-4">
              <div className="w-8 h-8 mx-auto border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <p className="text-gray-600">Processing payment...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handlePayment}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                {provider === 'gcash' ? 'Pay with GCash' : provider === 'paymaya' ? 'Pay with PayMaya' : 'Complete Payment'}
              </button>
              
              <button
                onClick={onClose}
                className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {countdown > 0 && !isProcessing && (
            <p className="text-xs text-gray-500 mt-4">
              This modal will auto-close in {countdown} seconds
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
