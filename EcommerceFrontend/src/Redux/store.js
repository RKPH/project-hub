import {configureStore} from "@reduxjs/toolkit";
import AuthSlice from "./AuthSlice";
import CartSlice from "./CartSlice.js";

const store = configureStore({
    reducer: {
        auth: AuthSlice,
        cart: CartSlice,
    },
});

export default store;