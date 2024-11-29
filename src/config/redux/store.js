import { configureStore } from '@reduxjs/toolkit';
import userslice from './reducers/userslice';
import cartslice from "./cart"

const store = configureStore({
  reducer: {
    user: userslice,
    cart: cartslice,
  },
});

export default store;


