import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../services/auth';
import { storageService } from '../services/storage';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

export const signup = createAsyncThunk(
    'auth/signup',
    async (userData: any, thunkAPI) => {
        try {
            const response = await authService.signup(userData);
            if (response.token) {
                await storageService.saveToken(response.token);
            }
            return response;
        } catch (error: any) {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.error) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async (userData: any, thunkAPI) => {
        try {
            const response = await authService.login(userData);
            if (response.token) {
                await storageService.saveToken(response.token);
            }
            return response;
        } catch (error: any) {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.error) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const googleLogin = createAsyncThunk(
    'auth/googleLogin',
    async (idToken: string, thunkAPI) => {
        try {
            const response = await authService.googleLogin(idToken);
            if (response.token) {
                await storageService.saveToken(response.token);
            }
            return response;
        } catch (error: any) {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.error) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const logout = createAsyncThunk('auth/logout', async () => {
    await authService.logout();
    await storageService.removeToken();
});

export const initializeAuth = createAsyncThunk(
    'auth/initialize',
    async (_, thunkAPI) => {
        try {
            const token = await storageService.getToken();
            if (token) {
                const user = await authService.getCurrentUser();
                return { user, token };
            }
            return null;
        } catch (error) {
            // Token might be invalid or expired
            await storageService.removeToken();
            return null;
        }
    }
);

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.error = null;
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(signup.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(signup.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(login.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(googleLogin.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(googleLogin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(googleLogin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
                state.isAuthenticated = false;
            })
            .addCase(initializeAuth.fulfilled, (state, action) => {
                if (action.payload) {
                    state.isAuthenticated = true;
                    state.user = action.payload.user;
                    state.token = action.payload.token;
                } else {
                    state.isAuthenticated = false;
                    state.user = null;
                    state.token = null;
                }
            });
    },
});

export const { reset, setUser } = authSlice.actions;
export default authSlice.reducer;
