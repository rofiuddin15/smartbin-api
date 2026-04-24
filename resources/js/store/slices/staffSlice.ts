import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface Staff {
    id: number;
    name: string;
    email: string;
    roles: string[];
    status: 'active' | 'suspended';
    created_at: string;
}

interface StaffState {
    staffList: Staff[];
    loading: boolean;
    error: string | null;
    lastFetched: number | null;
}

const initialState: StaffState = {
    staffList: [],
    loading: false,
    error: null,
    lastFetched: null,
};

export const fetchStaff = createAsyncThunk('staff/fetchStaff', async (_, { getState }) => {
    const state = getState() as { staff: StaffState };
    // Cache for 5 minutes
    if (state.staff.lastFetched && Date.now() - state.staff.lastFetched < 5 * 60 * 1000) {
        return state.staff.staffList;
    }
    const response = await api.get('/users');
    const data = response.data.data.data || response.data.data;
    return data.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        roles: u.roles || [],
        status: u.status || 'active',
        created_at: u.created_at
    }));
});

const staffSlice = createSlice({
    name: 'staff',
    initialState,
    reducers: {
        updateStaffInStore: (state, action: PayloadAction<Staff>) => {
            const index = state.staffList.findIndex(s => s.id === action.payload.id);
            if (index !== -1) {
                state.staffList[index] = action.payload;
            } else {
                state.staffList.push(action.payload);
            }
        },
        removeStaffFromStore: (state, action: PayloadAction<number>) => {
            state.staffList = state.staffList.filter(s => s.id !== action.payload);
        },
        invalidateStaffCache: (state) => {
            state.lastFetched = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStaff.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchStaff.fulfilled, (state, action) => {
                state.loading = false;
                state.staffList = action.payload;
                state.lastFetched = Date.now();
            })
            .addCase(fetchStaff.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch staff';
            });
    },
});

export const { updateStaffInStore, removeStaffFromStore, invalidateStaffCache } = staffSlice.actions;
export default staffSlice.reducer;
