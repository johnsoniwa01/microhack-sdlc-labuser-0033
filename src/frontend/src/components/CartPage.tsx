import { useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { api } from '../api/config';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function CartPage() {
  const { darkMode } = useTheme();
  const { items, subtotal, total, updateQuantity, removeItem, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('Guest Customer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);

  const cartCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const handleCheckout = async () => {
    if (!items.length) {
      setOrderMessage('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);
    setOrderMessage(null);

    try {
      const response = await axios.post(`${api.baseURL}${api.endpoints.cartCheckout}`, {
        branchId: 1,
        customerName: customerName.trim() || 'Guest Customer',
        items: items.map(({ productId, quantity }) => ({ productId, quantity })),
      });

      setOrderNumber(response.data.orderId);
      setOrderMessage(
        `Order #${response.data.orderId} placed successfully. Total: $${response.data.total.toFixed(2)}`,
      );
      clearCart();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.error?.message || 'We could not place your order right now.';
        setOrderMessage(message);
      } else {
        setOrderMessage('We could not place your order right now.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!items.length) {
    return (
      <div
        className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-24 px-4 transition-colors duration-300`}
      >
        <div className="max-w-4xl mx-auto">
          <div
            className={`rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-8 text-center shadow-sm`}
          >
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-900'} mb-4`}>
              Your cart is empty
            </h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              Add a few smart cat essentials to get started.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center rounded-lg bg-primary px-5 py-3 font-medium text-white hover:bg-accent transition-colors"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-dark' : 'bg-gray-100'} pt-24 px-4 transition-colors duration-300`}
    >
      <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div>
          <h1 className={`mb-6 text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-900'}`}>
            Shopping Cart ({cartCount})
          </h1>

          <div className="space-y-4">
            {items.map((item) => {
              const effectivePrice = item.price * (1 - (item.discount ?? 0));
              const lineTotal = effectivePrice * item.quantity;

              return (
                <div
                  key={item.productId}
                  className={`flex flex-col gap-4 rounded-xl border p-4 md:flex-row ${
                    darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={`/${item.imgName ?? 'placeholder.png'}`}
                      alt={item.name}
                      className="h-full w-full object-contain p-2"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-900'}`}>
                          {item.name}
                        </h2>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                          {item.unit ? `Unit: ${item.unit}` : 'Smart cat essentials'}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-sm text-red-500 hover:text-red-400"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${darkMode ? 'bg-gray-700 text-light' : 'bg-gray-200 text-gray-700'}`}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          -
                        </button>
                        <span className={`min-w-10 text-center font-medium ${darkMode ? 'text-light' : 'text-gray-900'}`}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${darkMode ? 'bg-gray-700 text-light' : 'bg-gray-200 text-gray-700'}`}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <div className={`text-lg font-bold ${darkMode ? 'text-light' : 'text-gray-900'}`}>
                          ${lineTotal.toFixed(2)}
                        </div>
                        <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                          ${effectivePrice.toFixed(2)} each
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside
          className={`rounded-xl border p-5 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} h-fit`}
        >
          <h2 className={`mb-4 text-2xl font-semibold ${darkMode ? 'text-light' : 'text-gray-900'}`}>
            Order summary
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Subtotal</span>
              <span className={darkMode ? 'text-light' : 'text-gray-900'}>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Shipping</span>
              <span className={darkMode ? 'text-light' : 'text-gray-900'}>Free</span>
            </div>
            <div className="flex justify-between border-t border-gray-600 pt-3 text-lg font-bold">
              <span className={darkMode ? 'text-light' : 'text-gray-900'}>Total</span>
              <span className={darkMode ? 'text-light' : 'text-gray-900'}>${total.toFixed(2)}</span>
            </div>
          </div>

          <label className={`mt-6 block text-sm font-medium ${darkMode ? 'text-light' : 'text-gray-700'}`}>
            Customer name
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className={`mt-2 w-full rounded-lg border px-3 py-2 outline-none ${
                darkMode ? 'border-gray-600 bg-gray-700 text-light' : 'border-gray-300 bg-white text-gray-900'
              }`}
              placeholder="Guest Customer"
            />
          </label>

          <button
            onClick={handleCheckout}
            disabled={isSubmitting}
            className="mt-6 w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Placing order...' : 'Checkout'}
          </button>

          {orderMessage && (
            <div
              className={`mt-4 rounded-lg border px-3 py-2 text-sm ${
                orderNumber
                  ? darkMode
                    ? 'border-green-800 bg-green-900/20 text-green-300'
                    : 'border-green-200 bg-green-50 text-green-700'
                  : darkMode
                    ? 'border-red-800 bg-red-900/20 text-red-300'
                    : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {orderMessage}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
