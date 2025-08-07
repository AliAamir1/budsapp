import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosError, AxiosInstance } from "axios";
import {
    ApiError,
    AuthResponse,
    CreateMatchData,
    ExamsResponse,
    LoginData,
    MatchesResponse,
    PotentialMatchesResponse,
    ProfileResponse,
    SignUpData,
    UpdateMatchData,
    UpdateProfileData,
} from "./types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_BASE_URL is not defined in environment variables"
  );
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem("access_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear storage and redirect to login
          await AsyncStorage.removeItem("access_token");
          await AsyncStorage.removeItem("refresh_token");
          // Note: Actual navigation should be handled in the app layer
        }

        const apiError: ApiError = {
          message:
            (error.response?.data as any)?.message ||
            error.message ||
            "An error occurred",
          code: error.response?.status?.toString(),
          details: error.response?.data,
        };

        return Promise.reject(apiError);
      }
    );
  }

  // Auth endpoints
  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>("/auth/signup", data);
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>("/auth/login", data);

    // Store tokens and user data in AsyncStorage
    if (response.data?.data?.session) {
      await AsyncStorage.setItem(
        "access_token",
        response.data.data.session.access_token
      );
      await AsyncStorage.setItem(
        "refresh_token",
        response.data.data.session.refresh_token
      );
      
      // Store user data if available
      if (response.data.data.user) {
        await AsyncStorage.setItem(
          "user_data",
          JSON.stringify(response.data.data.user)
        );
      }
    }

    return response.data;
  }

  async updateProfile(data: UpdateProfileData): Promise<ProfileResponse> {
    const response = await this.client.post<ProfileResponse>(
      "/profiles/edit",
      data
    );
    return response.data;
  }

  // Match endpoints
  async findPotentialMatches(
    userId: string,
    options?: { page?: number; limit?: number }
  ): Promise<PotentialMatchesResponse> {
    console.log("findPotentialMatches", userId, options);
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());

    const queryString = params.toString();
    const url = `/matches/${userId}${queryString ? `?${queryString}` : ""}`;

    const response = await this.client.get<PotentialMatchesResponse>(url);
    return response.data;
  }

  async findMatchedUsers(userId: string): Promise<MatchesResponse> {
    const response = await this.client.get<MatchesResponse>(
      `/matches/${userId}/all`
    );
    return response.data;
  }

  async createMatch(data: CreateMatchData): Promise<{ data: { id: string } }> {
    const response = await this.client.post<{ data: { id: string } }>(
      "/matches",
      data
    );
    return response.data;
  }

  async updateMatchStatus(
    data: UpdateMatchData
  ): Promise<{ data: { success: boolean } }> {
    const response = await this.client.patch<{ data: { success: boolean } }>(
      "/matches/status",
      data
    );
    return response.data;
  }

  // Exams endpoint
  async getExams(): Promise<ExamsResponse> {
    const response = await this.client.get<ExamsResponse>("/exams");
    return response.data;
  }

  // Auth utility methods
  async logout(): Promise<void> {
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");
    await AsyncStorage.removeItem("user_data");
  }

  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem("access_token");
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return !!token;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
