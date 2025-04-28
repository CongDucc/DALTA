export interface UserLoginParams {
    email: string;
    password: string;
}

export interface UserRegisterParams {
    firstName: string;
    lastName: string;
    email: string;
    mobileNo: string;
    password: string;
    confirmPassword: string;
    isAdmin?: boolean;
}

export interface UserInfo {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNo: string;
    isAdmin?: boolean;
    userAddressInfo?: UserAddressProps[];
    createdAt: Date;
}

export interface UserAddressProps {
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNo: string;
    deliveryInfo: string;
    region: string;
    city: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: UserInfo | null;
    isAdmin: boolean;
    loading: boolean;
    error: string | null;
}
