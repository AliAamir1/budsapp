import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "./api-client";
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

// Query Keys
export const queryKeys = {
  auth: ["auth"] as const,
  matches: ["matches"] as const,
  potentialMatches: (userId: string) =>
    ["matches", "potential", userId] as const,
  matchedUsers: (userId: string) => ["matches", "matched", userId] as const,
  exams: ["exams"] as const,
  profile: ["profile"] as const,
} as const;

// Auth Mutations
export const useSignUp = (): UseMutationResult<
  AuthResponse,
  ApiError,
  SignUpData
> => {
  return useMutation({
    mutationFn: (data: SignUpData) => apiClient.signUp(data),
  });
};

export const useLogin = (): UseMutationResult<
  AuthResponse,
  ApiError,
  LoginData
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginData) => apiClient.login(data),
    onSuccess: () => {
      // Invalidate auth-related queries on successful login
      queryClient.invalidateQueries({ queryKey: queryKeys.auth });
    },
  });
};

export const useUpdateProfile = (): UseMutationResult<
  ProfileResponse,
  ApiError,
  UpdateProfileData
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => apiClient.updateProfile(data),
    onSuccess: () => {
      // Invalidate profile queries
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
};

export const useLogout = (): UseMutationResult<void, ApiError, void> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear();
    },
  });
};

// Match Queries
export const usePotentialMatches = (
  userId: string,
  options?: { page?: number; limit?: number },
  enabled: boolean = true
): UseQueryResult<PotentialMatchesResponse, ApiError> => {
  return useQuery({
    queryKey: [...queryKeys.potentialMatches(userId), options],
    queryFn: () => apiClient.findPotentialMatches(userId, options),
    enabled: enabled && !!userId,
    staleTime: 0,
    refetchOnWindowFocus: true, // Enable focus refetching for this specific query
  });
};

export const useMatchedUsers = (
  userId: string,
  enabled: boolean = true
): UseQueryResult<MatchesResponse, ApiError> => {
  return useQuery({
    queryKey: queryKeys.matchedUsers(userId),
    queryFn: () => apiClient.findMatchedUsers(userId),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};


// Match Mutations
export const useCreateMatch = (): UseMutationResult<
  { data: { id: string } },
  ApiError,
  CreateMatchData
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMatchData) => apiClient.createMatch(data),
    onSuccess: (_, variables) => {
      // Invalidate potential matches for both users
      queryClient.invalidateQueries({
        queryKey: queryKeys.potentialMatches(variables.user1Id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.potentialMatches(variables.user2Id),
      });
    },
  });
};

export const useUpdateMatchStatus = (): UseMutationResult<
  { data: { success: boolean } },
  ApiError,
  UpdateMatchData
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMatchData) => apiClient.updateMatchStatus(data),
    onSuccess: () => {
      // Invalidate all match-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.matches });
    },
  });
};

// Exams Query
export const useExams = (
  enabled: boolean = true
): UseQueryResult<ExamsResponse, ApiError> => {
  return useQuery({
    queryKey: queryKeys.exams,
    queryFn: () => apiClient.getExams(),
    enabled,
    staleTime: 60 * 60 * 1000, // 1 hour - exams don't change frequently
  });
};

// Auth Status Query - Now simplified to work with auth context
export const useAuthStatus = (): UseQueryResult<boolean, ApiError> => {
  return useQuery({
    queryKey: queryKeys.auth,
    queryFn: () => apiClient.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: false, // Disable automatic queries - use auth context instead
  });
};
