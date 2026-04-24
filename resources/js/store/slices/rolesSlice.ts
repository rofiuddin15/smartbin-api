import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';

export interface Permission {
    id: number;
    name: string;
}

export interface Role {
    id: number;
    name: string;
    permissions: string[];
    users_count: number;
    created_at: string;
}

interface RolesState {
    roles: Role[];
    permissions: Permission[];
    loading: boolean;
    error: string | null;
    lastFetched: {
        roles: number | null;
        permissions: number | null;
    };
}

const initialState: RolesState = {
    roles: [],
    permissions: [],
    loading: false,
    error: null,
    lastFetched: {
        roles: null,
        permissions: null,
    },
};

export const fetchRoles = createAsyncThunk('roles/fetchRoles', async (_, { getState }) => {
    const state = getState() as { roles: RolesState };
    if (state.roles.lastFetched.roles && Date.now() - state.roles.lastFetched.roles < 10 * 60 * 1000) {
        return { roles: state.roles.roles };
    }
    const response = await api.get('/roles');
    return { roles: response.data.data };
});

export const fetchPermissions = createAsyncThunk('roles/fetchPermissions', async (_, { getState }) => {
    const state = getState() as { roles: RolesState };
    if (state.roles.lastFetched.permissions && Date.now() - state.roles.lastFetched.permissions < 60 * 60 * 1000) {
        return { permissions: state.roles.permissions };
    }
    const response = await api.get('/roles/permissions');
    return { permissions: response.data.data };
});

const rolesSlice = createSlice({
    name: 'roles',
    initialState,
    reducers: {
        invalidateRolesCache: (state) => {
            state.lastFetched.roles = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRoles.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRoles.fulfilled, (state, action) => {
                state.loading = false;
                state.roles = action.payload.roles;
                state.lastFetched.roles = Date.now();
            })
            .addCase(fetchRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch roles';
            })
            .addCase(fetchPermissions.fulfilled, (state, action) => {
                state.permissions = action.payload.permissions;
                state.lastFetched.permissions = Date.now();
            });
    },
});

export const { invalidateRolesCache } = rolesSlice.actions;
export default rolesSlice.reducer;
