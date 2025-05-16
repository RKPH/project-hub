import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        totalItems: 0, // Start with 0 and update from authSlice
    },
    reducers: {
        setCart: (state, action) => {
            state.totalItems = action.payload; // Set cart count
        },
        updateCart: (state, action) => {
            state.totalItems = action.payload; // Increment or decrement
        },
    },
});

export const { setCart, updateCart } = cartSlice.actions;
export default cartSlice.reducer;
