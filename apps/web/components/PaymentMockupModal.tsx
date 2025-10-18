import React, { useEffect } from "react";

interface PaymentMockupModalProps {
  open: boolean;
  onClose: () => void;
  amount: number | string;
  provider?: "gcash" | "paymaya" | string; // optional, default 'gcash'
  txnId?: string;
}

export default function PaymentMockupModal({
  open,
  onClose,
  amount,
  provider = "gcash",
  txnId,
}: PaymentMockupModalProps) {
  // don't render when closed
  if (!open) return null;

  // safe parse amount -> number
  const parsedAmount = Number(String(amount).replace(/[^0-9.-]+/g, "")) || 0;

  const formatter = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  });

  // fallback txn id if none provided
  const id = txnId || `txn_${Date.now().toString(36).slice(-8)}`;

  // Image paths (adjust as needed)
  const gcashHeader = "/icon/Gcash_logo.png"; // decorative header image
  const paymayaQrMock = "/icon/maya.jpg"; // QR illustration for PayMaya
  const gcashLogo = "/icon/gcash.png"; // optional small logos
  const paymayaLogo = "/icon/pmaya.png";

  // simple focus management: focus first input when modal opens
  useEffect(() => {
    const input = document.querySelector<HTMLInputElement>("#gcash-input");
    if (input) (input).focus();
    // lock scroll on body while modal open
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center px-4 py-8"
      role="presentation"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Payment mockup dialog"
        className="relative w-full max-w-3xl rounded-2xl bg-white shadow-xl overflow-hidden"
        style={{ maxHeight: "calc(100vh - 4rem)" }}
      >
        {/* Close */}
        <button
          aria-label="Close payment dialog"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 size-9 rounded-full hover:bg-neutral-100 flex items-center justify-center"
        >
          ✕
        </button>

        {/* Provider: GCash */}
        {provider === "gcash" && (
          <>
            <div className="bg-blue-600 h-36 flex items-center justify-center relative">
           
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-3">
                    
                  <img
                    src={gcashLogo}
                    alt=""
                    onError={(e) => (e.currentTarget.style.display = "none")}
                    className="h-8 w-auto"
                  />
                  <h2 className="text-white text-3xl font-bold">GCash</h2>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-auto">
              <div className="rounded-md bg-white shadow-sm border">
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div>Merchant</div>
                    <div className="font-medium text-gray-800">Refurnish</div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm text-gray-500">Amount Due</div>
                    <div className="text-lg font-semibold text-blue-500">
                      {formatter.format(parsedAmount)}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-center text-gray-700 font-semibold mb-4">
                    Login to pay with GCash
                  </h3>

                  <div className="flex items-center justify-center mb-3 text-sm text-gray-500">
                    +63
                </div>

                  <div className="mb-4">
                    <input
                      id="payment-mockup-first-input"
                      type="tel"
                      placeholder="Mobile number"
                      className="w-full px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>

                  <button className="w-full py-3 rounded-full bg-blue-500 text-white font-semibold">
                    NEXT
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center text-sm text-gray-500">
                Don't have a GCash account?{" "}
                <a href="#" className="text-blue-200 underline">
                  Register now
                </a>
              </div>
            </div>
          </>
        )}

        {/* Provider: PayMaya (QR) */}
        {provider === "paymaya" && (
          <>
            <div className="bg-white h-20 flex items-center justify-center border-b">
              <div className="flex items-center gap-3">
                <img
                  src={paymayaLogo}
                  alt="Maya"
                  className="h-6 w-auto"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            </div>

            <div className="p-6 overflow-auto">
              <div className="max-w-md mx-auto bg-white p-4 rounded-lg shadow-sm border">
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div>Merchant</div>
                    <div className="font-medium text-gray-800">Refurnish</div>
                  </div>

                  <div className="mt-3 text-center">
                    <div className="text-lg font-semibold">
                      {formatter.format(parsedAmount)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  {/* QR image (replace with real QR if you have one) */}
                  <img
                    src={paymayaQrMock}
                    alt="PayMaya QR"
                    className="w-48 h-48 object-contain rounded-md border p-2 bg-white"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />

                  <div className="text-sm text-gray-600 text-center">
                    <div>
                      Txn ID: <span className="font-medium">{id}</span>
                    </div>
                    <div className="mt-2 text-gray-500">
                      Scan this code with your bank or e-wallet app to pay.
                    </div>
                  </div>

                  <button className="w-full mt-3 py-3 rounded-full bg-green-600 text-white font-semibold">
                    I PAID — VERIFY
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Fallback for other providers */}
        {!["gcash", "paymaya"].includes(provider) && (
          <div className="p-6">
            <div className="text-gray-700">
              Payment provider <strong>{String(provider)}</strong> is not supported by
              this mock modal.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
