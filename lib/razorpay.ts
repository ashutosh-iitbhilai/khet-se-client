import type { OnlinePayment } from '@/types';

/* Razorpay Checkout loader. Only used when the API reports online payment as enabled. */

interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

let loading: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve();
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loading = null;
      reject(new Error('Could not load the payment window. Check your connection and try again.'));
    };
    document.body.appendChild(s);
  });
  return loading;
}

/**
 * Opens Razorpay Checkout. Resolves with the signed result on success,
 * or null if the customer closed the window.
 */
export async function openRazorpay(payment: OnlinePayment): Promise<RazorpaySuccess | null> {
  await loadScript();
  return new Promise((resolve) => {
    const rzp = new window.Razorpay!({
      key: payment.keyId,
      order_id: payment.razorpayOrderId,
      amount: payment.amount,
      currency: payment.currency,
      name: 'Khet Se',
      description: `Order ${payment.orderNumber}`,
      prefill: payment.prefill,
      theme: { color: '#2F6B3B' },
      handler: (res: RazorpaySuccess) => resolve(res),
      modal: { ondismiss: () => resolve(null) },
    });
    rzp.open();
  });
}
