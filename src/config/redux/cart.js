import { createSlice } from "@reduxjs/toolkit";


const userslice = createSlice({
  name: 'cart',
  initialState: {
   price: "12$",
   discruption: "this is a product for sell",
   sell: "11-11",
   productName: "T-Shirt"
  },
  reducers: {
    add: () => {},
    del: () => {},
  },
});

export const { add, del } = userslice.actions; // yahan pr hm reducers k functions export krte hain jo hm chahte hain
export default userslice.reducer; // initial state export ho rhi hai yahan pr jo k yahan pr e pty object hai