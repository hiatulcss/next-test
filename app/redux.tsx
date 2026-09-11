
"use client";

import React from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";

type Product = {
  id: number;
  name: string;
  price: number;
};

type CartItem = {
  id: number;
  name: string;
  price: number;
  qty: number;
};

type CartState = {
  items: CartItem[];
};

const products: Product[] = [
  { id: 1, name: "Apple Watch", price: 149 },
  { id: 2, name: "Nike Shoes", price: 89 },
  { id: 3, name: "Coffee Maker", price: 75 },
  { id: 4, name: "Desk Lamp", price: 35 },
];

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] as CartItem[] },
  reducers: {
    addItem: (state: CartState, action: PayloadAction<Product>) => {
      const existing = state.items.find((item) => item.id === action.payload.id);

      if (existing) {
        existing.qty += 1;
      } else {
        state.items.push({
          ...action.payload,
          qty: 1,
        });
      }
    },
    removeItem: (state: CartState, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    updateQty: (
      state: CartState,
      action: PayloadAction<{ id: number; qty: number }>
    ) => {
      const item = state.items.find((entry) => entry.id === action.payload.id);

      if (!item) {
        return;
      }

      item.qty = Math.max(0, action.payload.qty);

      if (item.qty === 0) {
        state.items = state.items.filter((entry) => entry.id !== action.payload.id);
      }
    },
    clearCart: (state: CartState) => {
      state.items = [];
    },
  },
});

const cartReducer = cartSlice.reducer;
const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

const { addItem, removeItem, updateQty, clearCart } = cartSlice.actions;

const selectCart = (state: { cart: CartState }) => state.cart;
const cartTotalSelector = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);

function ProductList() {
  const dispatch = useDispatch();

  return (
    <section className="w-full">
      <h2 className="mb-4 text-2xl font-semibold">Products</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between rounded-lg border border-slate-300 p-4"
          >
            <div>
              <div className="font-semibold">{product.name}</div>
              <div className="text-sm text-slate-500">${product.price}</div>
            </div>
            <button
              className="rounded bg-black px-4 py-2 text-white"
              onClick={() => dispatch(addItem(product))}
            >
              Add
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function CartPanel() {
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const total = useSelector(cartTotalSelector);

  return (
    <aside className="mt-8 w-full rounded-lg border border-slate-300 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Cart</h2>
        <button
          className="rounded border border-slate-400 px-3 py-1 text-sm"
          onClick={() => dispatch(clearCart())}
        >
          Clear Cart
        </button>
      </div>

      {cart.items.length === 0 ? (
        <div className="py-4 text-slate-500">Cart is empty.</div>
      ) : (
        <div className="mt-4 space-y-3">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded border border-slate-200 p-3"
            >
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-sm text-slate-500">
                  ${item.price} x {item.qty}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded border border-slate-400 px-2"
                  onClick={() => dispatch(updateQty({ id: item.id, qty: item.qty - 1 }))}
                >
                  -
                </button>
                <span className="min-w-8 text-center">{item.qty}</span>
                <button
                  className="rounded border border-slate-400 px-2"
                  onClick={() => dispatch(updateQty({ id: item.id, qty: item.qty + 1 }))}
                >
                  +
                </button>
                <button
                  className="rounded bg-red-500 px-3 py-1 text-white"
                  onClick={() => dispatch(removeItem(item.id))}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 border-t border-slate-300 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Cart Total</span>
          <span className="text-lg font-semibold">${total}</span>
        </div>
      </div>
    </aside>
  );
}

export default function Home() {
  return (
    <Provider store={store}>
      <main className="min-h-screen bg-zinc-50 p-8 text-slate-900">
        <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow">
          <h1 className="mb-8 text-4xl font-bold">Shop Cart</h1>
          <ProductList />
          <CartPanel />
        </div>
      </main>
    </Provider>
  );
}

