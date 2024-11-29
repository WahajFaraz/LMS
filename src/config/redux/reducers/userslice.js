import { createSlice } from "@reduxjs/toolkit";

const userslice = createSlice({
  name: "user",
  initialState: {
    data :{ email: "mohsin#gmail.com", Password: "12121" },
  },
  reducers: {
    add: (state, action) => {
      state.data= action.payload;
    },
    del: () => {},
  },
});

export const { add, del } = userslice.actions; // yahan pr hm reducers k functions export krte hain jo hm chahte hain
export default userslice.reducer; // initial state export ho rhi hai yahan pr jo k yahan pr e pty object hai
