import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Perfume } from '@/types/perfume';

export interface CartItem {
  perfume: Perfume;
  quantity: number;
}

export interface CartSummary {
  totalUnits: number;
  subtotal: number;
  total: number;
}

export interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  subtotal: number;
  summary: CartSummary;
  error: string | null;
  clearError: () => void;
  openCart: () => void;
  closeCart: () => void;
  addItem: (perfume: Perfume, quantity?: number) => void;
  updateQuantity: (perfumeId: string, quantity: number) => void;
  removeItem: (perfumeId: string) => void;
  clearCart: () => void;
}

const STORAGE_KEY = 'marjav_perfumes_cart_v1';

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed: unknown = JSON.parse(saved);
      return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignora errores de almacenamiento en navegadores embebidos o modo privado estricto
    }
  }, [items]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const openCart = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, []);

  const removeItem = useCallback((perfumeId: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.perfume.id !== perfumeId)
    );
    setError(null);
  }, []);

  const addItem = useCallback((perfume: Perfume, quantity = 1) => {
    if (!perfume.inStock) {
      setError(`"${perfume.name}" no está disponible en este momento.`);
      setIsOpen(true);
      return;
    }

    if (quantity <= 0) return;

    setError(null);
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.perfume.id === perfume.id
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      return [...prevItems, { perfume, quantity }];
    });

    setIsOpen(true);
  }, []);

  const updateQuantity = useCallback(
    (perfumeId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(perfumeId);
        return;
      }

      setError(null);
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.perfume.id === perfumeId ? { ...item, quantity } : item
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setError(null);
  }, []);

  const summary = useMemo<CartSummary>(() => {
    const totals = items.reduce(
      (acc, item) => ({
        totalUnits: acc.totalUnits + item.quantity,
        subtotal: acc.subtotal + item.perfume.price * item.quantity,
      }),
      { totalUnits: 0, subtotal: 0 }
    );

    return {
      totalUnits: totals.totalUnits,
      subtotal: totals.subtotal,
      total: totals.subtotal,
    };
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isOpen,
      totalItems: summary.totalUnits,
      subtotal: summary.subtotal,
      summary,
      error,
      clearError,
      openCart,
      closeCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      items,
      isOpen,
      summary,
      error,
      clearError,
      openCart,
      closeCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe utilizarse dentro de un CartProvider');
  }
  return context;
}