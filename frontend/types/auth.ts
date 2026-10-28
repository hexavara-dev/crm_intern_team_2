export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  tenantId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface OnboardData {
  tenantName: string;
  email: string;
  password: string;
  name?: string;
}

export interface RegisterData {
  name?: string;
  password: string;
  email?: string;
  tenantId?: string;
}

export interface AuthResponse {
  user: AuthUser;
  tenant?: {
    id: string;
    name: string;
  };
}
