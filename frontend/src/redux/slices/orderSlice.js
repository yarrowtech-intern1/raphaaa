import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to fecth user orders
export const fetchUserOrders = createAsyncThunk("orders/fetchUserOrders", async(_, {rejectWithValue}) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders/my-orders`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`,
                }
            }
        );
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
})

// Async thunk to fetch orders details by ID
export const fetchOrderDetails = createAsyncThunk("orders/fetchOrderDetails", async (orderId, {rejectWithValue}) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`,
                }
            }
        );
        return response.data;
    } catch (error) {
        rejectWithValue(error.response.data);
    }
});

export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}/cancel`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to cancel order" });
    }
  }
);

export const createReturnRequest = createAsyncThunk(
  "orders/createReturnRequest",
  async ({ orderId, requestType, reason, itemProductIds }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/returns`,
        {
          orderId,
          requestType,
          reason,
          itemProductIds: itemProductIds?.join(","),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to create return request" });
    }
  }
);

export const fetchMyReturnRequests = createAsyncThunk(
  "orders/fetchMyReturnRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/returns/my`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "Failed to fetch return requests" });
    }
  }
);

const orderSlice = createSlice({
    name: "orders",
    initialState: {
        orders: [],
        returnRequests: [],
        totalOrders: 0,
        orderDetails: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
        // Fetch user orders
        .addCase(fetchUserOrders.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchUserOrders.fulfilled, (state, action) => {
            state.loading = false;
            state.orders = action.payload;
        })
        .addCase(fetchUserOrders.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message;
        })
        // Fetch order details
        .addCase(fetchOrderDetails.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchOrderDetails.fulfilled, (state, action) => {
            state.loading = false;
            state.orderDetails = action.payload;
        })
        .addCase(fetchOrderDetails.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message;
        })
        .addCase(cancelOrder.fulfilled, (state, action) => {
            state.orderDetails = action.payload;
            state.orders = state.orders.map((o) =>
              o._id === action.payload._id ? action.payload : o
            );
        })
        .addCase(cancelOrder.rejected, (state, action) => {
            state.error = action.payload?.message || "Failed to cancel order";
        })
        .addCase(createReturnRequest.fulfilled, (state, action) => {
            state.returnRequests = [action.payload, ...(state.returnRequests || [])];
        })
        .addCase(createReturnRequest.rejected, (state, action) => {
            state.error = action.payload?.message || "Failed to create return request";
        })
        .addCase(fetchMyReturnRequests.fulfilled, (state, action) => {
            state.returnRequests = action.payload || [];
        })
        .addCase(fetchMyReturnRequests.rejected, (state, action) => {
            state.error = action.payload?.message || "Failed to fetch return requests";
        })
    }
});

export default orderSlice.reducer;
