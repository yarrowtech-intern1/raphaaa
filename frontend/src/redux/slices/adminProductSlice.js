import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// const API_URL = `${import.meta.env.VITE_BACKEND_URL}`;
// const USER_TOKEN = `Bearer ${localStorage.getItem(userToken)}`;

// Async thunk to fetch the admin products
export const fetchAdminProducts = createAsyncThunk("adminProducts/fetchProducts", async() => {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/products`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            }
        }
    )
    return response.data;
});

// Async function to create a new product
export const createProduct = createAsyncThunk("adminProducts/createProduct", async (productData) => {
    const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/products`,
        productData,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            },
        }
    );
    return response.data;
});

// Async thunk to update an existing product
export const updatePrroduct = createAsyncThunk("adminProducts/updateProduct", async ({ id, productData }) => {
    const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/admin/products/${id}`,
        productData,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            }
        }
    )
    return response.data;
})

// Async thunk to delete the product
export const deleteProduct = createAsyncThunk("adminProducts/deleteProduct", async (id) => {
    await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            }
        }
    )
    return id;
})
const adminProductSlice = createSlice({
    name: "adminProducts",
    initialState: {
        products: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder)=>{
        builder
        .addCase(fetchAdminProducts.pending, (state) => {
            state.loading = true;
        })
        .addCase(fetchAdminProducts.fulfilled, (state, action) => {
            state.loading = false;
            state.products = action.payload;
        })
        .addCase(fetchAdminProducts.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        })
        // create product
        .addCase(createProduct.fulfilled, (state, action)=>{
            state.products.push(action.payload);
        })
        // Update product
        .addCase(updatePrroduct.fulfilled, (state, action) => {
            const index = state.products.findIndex((product) => product._id === action.payload._id);
            if(index !== -1){
                state.products[index] = action.payload;
            }
        })
        // Delete Product
        .addCase(deleteProduct.fulfilled, (state, action) => {
            state.products = state.products.filter((product) => product._id !== action.payload);
        })
    }
});

export default adminProductSlice.reducer;