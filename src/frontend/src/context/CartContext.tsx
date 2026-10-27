import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export interface CartProduct {
  productId: number;
  name: string;
  description?: string;
  price: number;
  discount?: number;
  imgName?: string;
  unit?: string;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  total: number;
  addItem: (product: CartProduct, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: number) => number;
}

const STORAGE_KEY = 'octocat-cart';
const CartContext = createContext<CartContextValue | undefined>(undefined);

const readStoredCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];

  try {
    const savedCart = window.localStorage.getItem(STORAGE_KEY);
    if (!savedCart) return [];
    return JSON.parse(savedCart) as CartItem[];
  } catch {
    return [];
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const addItem = (product: CartProduct, quantity = 1) => {
    setItems((currentItems) => {
      const match = currentItems.find((item) => item.productId === product.productId);
      if (match) {
        return currentItems.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [...currentItems, { ...product, quantity }];
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setItems((currentItems) => {
      if (quantity <= 0) {
        return currentItems.filter((item) => item.productId !== productId);
      }

      return currentItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      );
    });
  };

  const removeItem = (productId: number) => {
    setItems((currentItems) => currentItems.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (productId: number) =>
    items.find((item) => item.productId === productId)?.quantity ?? 0;

  const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  );

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const effectivePrice = item.price * (1 - (item.discount ?? 0));
        return sum + effectivePrice * item.quantity;
      }, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalItems,
      subtotal,
      total,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      getItemQuantity,
    }),
    [items, totalItems, subtotal, total],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
