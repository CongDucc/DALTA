import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './redux/CartReducer';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    // Các reducer khác nếu có
  },
  // Thêm middleware để kiểm tra các thay đổi state
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

// Export RootState và AppDispatch để sử dụng với TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
