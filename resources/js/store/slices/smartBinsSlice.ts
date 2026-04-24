import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface SmartBin {
    id: number;
    bin_code: string;
    name: string;
    location: string;
    responsible_person: string;
    username: string;
    latitude: number;
    longitude: number;
    status: 'online' | 'offline' | 'full' | 'maintenance';
    capacity_percentage: number;
    total_bottles_collected: number;
    last_online_at: string;
}

interface SmartBinsState {
    bins: SmartBin[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
}

const initialState: SmartBinsState = {
    bins: [],
    loading: false,
    error: null,
    lastFetched: null,
};

export const fetchBins = createAsyncThunk('smartBins/fetchBins', async (_, { getState }) => {
    const state = getState() as { smartBins: SmartBinsState };
    // Cache for 5 minutes
    if (state.smartBins.lastFetched && Date.now() - state.smartBins.lastFetched < 5 * 60 * 1000) {
        return state.smartBins.bins;
    }
    const response = await api.get('/smart-bins');
    return response.data.data;
});

const smartBinsSlice = createSlice({
    name: 'smartBins',
    initialState,
    reducers: {
        setBins: (state, action: PayloadAction<SmartBin[]>) => {
            state.bins = action.payload;
            state.lastFetched = Date.now();
        },
        addBin: (state, action: PayloadAction<SmartBin>) => {
            state.bins.push(action.payload);
        },
        updateBin: (state, action: PayloadAction<SmartBin>) => {
            const index = state.bins.findIndex(bin => bin.id === action.payload.id);
            if (index !== -1) {
                state.bins[index] = action.payload;
            }
        },
        deleteBin: (state, action: PayloadAction<number>) => {
            state.bins = state.bins.filter(bin => bin.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBins.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchBins.fulfilled, (state, action) => {
                state.loading = false;
                state.bins = action.payload;
                state.lastFetched = Date.now();
            })
            .addCase(fetchBins.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch bins';
            });
    },
});

export const { setBins, addBin, updateBin, deleteBin } = smartBinsSlice.actions;
export default smartBinsSlice.reducer;
