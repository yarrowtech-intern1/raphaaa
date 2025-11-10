// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';

// // const API_URL = process.env.VITE_BACKEND_URL || 'http://localhost:5000';
// const API_URL = import.meta.env.VITE_BACKEND_URL;

// // Create order
// export const createOrder = createAsyncThunk(
//     'payment/createOrder',
//     async (orderData, { rejectWithValue, getState }) => {
//         try {
//             const { auth } = getState();
//             const config = {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${auth.token}`
//                 }
//             };
            
//             const response = await axios.post(`${API_URL}/api/payments/create-order`, orderData, config);
//             return response.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || { message: error.message });
//         }
//     }
// );

// // Verify payment
// export const verifyPayment = createAsyncThunk(
//     'payment/verifyPayment',
//     async (paymentData, { rejectWithValue, getState }) => {
//         try {
//             const { auth } = getState();
//             const config = {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${auth.token}`
//                 }
//             };
            
//             const response = await axios.post(`${API_URL}/api/payments/verify-payment`, paymentData, config);
//             return response.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || { message: error.message });
//         }
//     }
// );

// // Handle payment failure
// export const handlePaymentFailure = createAsyncThunk(
//     'payment/handleFailure',
//     async (failureData, { rejectWithValue, getState }) => {
//         try {
//             const { auth } = getState();
//             const config = {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${auth.token}`
//                 }
//             };
            
//             const response = await axios.post(`${API_URL}/api/payments/payment-failed`, failureData, config);
//             return response.data;
//         } catch (error) {
//             return rejectWithValue(error.response?.data || { message: error.message });
//         }
//     }
// );

// const paymentSlice = createSlice({
//     name: 'payment',
//     initialState: {
//         loading: false,
//         error: null,
//         order: null,
//         paymentResult: null
//     },
//     reducers: {
//         clearPaymentState: (state) => {
//             state.loading = false;
//             state.error = null;
//             state.order = null;
//             state.paymentResult = null;
//         }
//     },
//     extraReducers: (builder) => {
//         builder
//             // Create order
//             .addCase(createOrder.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(createOrder.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.order = action.payload;
//             })
//             .addCase(createOrder.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload?.message || 'Failed to create order';
//             })
//             // Verify payment
//             .addCase(verifyPayment.pending, (state) => {
//                 state.loading = true;
//                 state.error = null;
//             })
//             .addCase(verifyPayment.fulfilled, (state, action) => {
//                 state.loading = false;
//                 state.paymentResult = action.payload;
//             })
//             .addCase(verifyPayment.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload?.message || 'Payment verification failed';
//             })
//             // Handle payment failure
//             .addCase(handlePaymentFailure.pending, (state) => {
//                 state.loading = true;
//             })
//             .addCase(handlePaymentFailure.fulfilled, (state) => {
//                 state.loading = false;
//             })
//             .addCase(handlePaymentFailure.rejected, (state, action) => {
//                 state.loading = false;
//                 state.error = action.payload?.message || 'Failed to handle payment failure';
//             });
//     }
// });

// export const { clearPaymentState } = paymentSlice.actions;
// export default paymentSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

 // const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_URL = import.meta.env.VITE_BACKEND_URL

// Create order
export const createOrder = createAsyncThunk(
    'payment/createOrder',
    async (orderData, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`
                }
            };
            
            const response = await axios.post(`${API_URL}/api/payments/create-order`, orderData, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

// Verify payment
export const verifyPayment = createAsyncThunk(
    'payment/verifyPayment',
    async (paymentData, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`
                }
            };
            
            const response = await axios.post(`${API_URL}/api/payments/verify-payment`, paymentData, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

// Handle payment failure
export const handlePaymentFailure = createAsyncThunk(
    'payment/handleFailure',
    async (failureData, { rejectWithValue, getState }) => {
        try {
            const { auth } = getState();
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.token}`
                }
            };
            
            const response = await axios.post(`${API_URL}/api/payments/payment-failed`, failureData, config);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || { message: error.message });
        }
    }
);

const paymentSlice = createSlice({
    name: 'payment',
    initialState: {
        loading: false,
        error: null,
        order: null,
        paymentResult: null
    },
    reducers: {
        clearPaymentState: (state) => {
            state.loading = false;
            state.error = null;
            state.order = null;
            state.paymentResult = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create order
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.order = action.payload;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to create order';
            })
            // Verify payment
            .addCase(verifyPayment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyPayment.fulfilled, (state, action) => {
                state.loading = false;
                state.paymentResult = action.payload;
            })
            .addCase(verifyPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Payment verification failed';
            })
            // Handle payment failure
            .addCase(handlePaymentFailure.pending, (state) => {
                state.loading = true;
            })
            .addCase(handlePaymentFailure.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(handlePaymentFailure.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to handle payment failure';
            });
    }
});

export const { clearPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;