import React, { createContext, useContext, useState, ReactNode } from "react";
import { type Product } from "@/lib/services/products";
import { MAX_UNITS_PER_PRODUCT } from "@/lib/constants/cart";

export interface CartItem extends Product {
  quantity: number;
  selectedVariantId?: string;
  itemPrice: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variantId?: string) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string, products?: Product[]) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: Product, variantId?: string) => {
    setCart((prev) => {
      const cartKey = variantId ? `${product.id}-${variantId}` : product.id;
      const itemPrice = variantId
        ? (product.variants?.find(v => v.id === variantId)?.price ?? product.price)
        : product.price;

      const existing = prev.find((item) => {
        const itemKey = item.selectedVariantId ? `${item.id}-${item.selectedVariantId}` : item.id;
        return itemKey === cartKey;
      });

      if (existing) {
        const maxStock = variantId
          ? (product.variants?.find(v => v.id === variantId)?.quantity ?? 0)
          : product.quantity;
        const cap = Math.min(maxStock, MAX_UNITS_PER_PRODUCT);
        const newQuantity = Math.min(existing.quantity + 1, cap);
        if (newQuantity === existing.quantity) {
          return prev;
        }
        return prev.map((item) => {
          const itemKey = item.selectedVariantId ? `${item.id}-${item.selectedVariantId}` : item.id;
          return itemKey === cartKey ? { ...item, quantity: newQuantity } : item;
        });
      }
      return [...prev, { ...product, quantity: 1, selectedVariantId: variantId, itemPrice }];
    });
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart((prev) => {
      const cartKey = variantId ? `${productId}-${variantId}` : productId;
      return prev.filter((item) => {
        const itemKey = item.selectedVariantId ? `${item.id}-${item.selectedVariantId}` : item.id;
        return itemKey !== cartKey;
      });
    });
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string, products: Product[] = []) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
    } else {
      const product = products.find((p) => p.id === productId);
      if (product) {
        const maxStock = variantId
          ? (product.variants?.find(v => v.id === variantId)?.quantity ?? 0)
          : product.quantity;
        const validQuantity = Math.min(quantity, maxStock, MAX_UNITS_PER_PRODUCT);
        setCart((prev) => {
          const cartKey = variantId ? `${productId}-${variantId}` : productId;
          return prev.map((item) => {
            const itemKey = item.selectedVariantId ? `${item.id}-${item.selectedVariantId}` : item.id;
            return itemKey === cartKey ? { ...item, quantity: validQuantity } : item;
          });
        });
      }
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
