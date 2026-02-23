'use client';

import type { Cart, CartItem, Product } from 'lib/sfdc';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type UpdateType = 'plus' | 'minus' | 'delete';

type CartContextType = {
  cart: Cart | undefined;
  updateCartItem: (merchandiseId: string, updateType: UpdateType) => void;
  addCartItem: (product: Product, quantity?: number) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function calculateItemCost(quantity: number, price: string): string {
  return (Number(price) * quantity).toString();
}

function updateCartItemQuantity(item: CartItem, updateType: UpdateType): CartItem | null {
  if (updateType === 'delete') return null;

  const newQuantity = updateType === 'plus' ? item.quantity + 1 : item.quantity - 1;
  if (newQuantity === 0) return null;

  const singleItemAmount = Number(item.cost.totalAmount.amount) / item.quantity;
  const newTotalAmount = calculateItemCost(newQuantity, singleItemAmount.toString());

  return {
    ...item,
    quantity: newQuantity,
    cost: {
      ...item.cost,
      totalAmount: {
        ...item.cost.totalAmount,
        amount: newTotalAmount
      }
    }
  };
}

function createOrUpdateCartItem(
  existingItem: CartItem | undefined,
  product: Product,
  quantity: number = 1
): CartItem {
  const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;
  const totalAmount = calculateItemCost(newQuantity, product.price.amount);

  return {
    id: existingItem?.id,
    quantity: newQuantity,
    cost: {
      totalAmount: {
        amount: totalAmount,
        currencyCode: product.price.currencyCode
      }
    },
    merchandise: {
      id: product.id,
      title: product.title,
      product: {
        id: product.id,
        handle: product.handle,
        title: product.title,
        featuredImage: product.featuredImage
      }
    }
  };
}

function updateCartTotals(lines: CartItem[]): Pick<Cart, 'totalQuantity' | 'cost'> {
  const totalQuantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = lines.reduce((sum, item) => sum + Number(item.cost.totalAmount.amount), 0);
  const currencyCode = lines[0]?.cost.totalAmount.currencyCode ?? 'USD';

  return {
    totalQuantity,
    cost: {
      subtotalAmount: { amount: totalAmount.toString(), currencyCode },
      totalAmount: { amount: totalAmount.toString(), currencyCode },
      totalTaxAmount: { amount: '0', currencyCode }
    }
  };
}

function createEmptyCart(): Cart {
  return {
    id: undefined,
    checkoutUrl: '',
    totalQuantity: 0,
    lines: [],
    cost: {
      subtotalAmount: { amount: '0', currencyCode: 'USD' },
      totalAmount: { amount: '0', currencyCode: 'USD' },
      totalTaxAmount: { amount: '0', currencyCode: 'USD' }
    }
  };
}

export function CartProvider({
  children,
  cartPromise
}: {
  children: React.ReactNode;
  cartPromise: Promise<Cart | undefined>;
}) {
  const [cart, setCart] = useState<Cart | undefined>(undefined);

  // Resolve the cart promise non-blocking — page renders immediately,
  // badge/total populate once the API responds.
  // Re-runs when the layout re-renders after revalidateTag (new promise reference).
  // Guard: if the promise resolves to undefined (transient error), keep existing data.
  useEffect(() => {
    cartPromise.then((newCart) => {
      setCart((prev) => newCart ?? prev);
    });
  }, [cartPromise]);

  // Optimistic add: updates cart state immediately so badge/total reflect the change.
  // Unlike useOptimistic, this persists until the next server sync — no flash/revert.
  const addCartItem = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const currentCart = prev || createEmptyCart();
      const existingItem = currentCart.lines.find((item) => item.merchandise.id === product.id);
      const updatedItem = createOrUpdateCartItem(existingItem, product, quantity);

      const updatedLines = existingItem
        ? currentCart.lines.map((item) => (item.merchandise.id === product.id ? updatedItem : item))
        : [...currentCart.lines, updatedItem];

      return { ...currentCart, ...updateCartTotals(updatedLines), lines: updatedLines };
    });
  };

  // Optimistic update (quantity +/- or delete)
  const updateCartItem = (merchandiseId: string, updateType: UpdateType) => {
    setCart((prev) => {
      if (!prev) return prev;

      const updatedLines = prev.lines
        .map((item) =>
          item.merchandise.id === merchandiseId ? updateCartItemQuantity(item, updateType) : item
        )
        .filter(Boolean) as CartItem[];

      if (updatedLines.length === 0) {
        return {
          ...prev,
          lines: [],
          totalQuantity: 0,
          cost: {
            ...prev.cost,
            totalAmount: { ...prev.cost.totalAmount, amount: '0' }
          }
        };
      }

      return { ...prev, ...updateCartTotals(updatedLines), lines: updatedLines };
    });
  };

  const value = useMemo(
    () => ({
      cart,
      updateCartItem,
      addCartItem
    }),
    [cart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
