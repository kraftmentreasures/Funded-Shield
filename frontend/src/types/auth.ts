export interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ApiError {
  detail: string;
}
