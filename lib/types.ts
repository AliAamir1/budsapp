// API Types based on Postman collection
import { z } from "zod";

// Auth Schemas
export const SignUpSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    full_name: z.string().min(1),
    confirm_password: z.string().min(6),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RefreshSchema = z.object({
  refresh_token: z.string().min(1),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  birthdate: z.string().optional(), // ISO date string
  region: z.string().min(1, { message: "Region is required" }).optional(),
  course: z.string().min(1, { message: "Course is required" }).optional(),
  examDate: z.string().min(1, { message: "Exam date is required" }).optional(), // ISO date string
  partner_preferences: z
    .object({
      study_schedule: z
        .string()
        .min(1, { message: "Study schedule is required" })
        .optional(),
      communication_style: z
        .string()
        .min(1, { message: "Communication style is required" })
        .optional(),
    })
    .optional(),
  bio: z.string().min(1, { message: "Bio is required" }).optional(),
  is_premium: z.boolean().optional(),
  examPreferences: z
    .object({
      exam_id: z.string().uuid(),
      study_start_date: z.string(), // ISO date string
      study_end_date: z.string(), // ISO date string
      daily_study_time: z.string(), // HH:mm:ss format
      intensity: z.enum(["light", "moderate", "intense"]),
    })
    .optional(),
});

// Match Schemas
export const CreateMatchSchema = z.object({
  user1Id: z.string().uuid(),
  user2Id: z.string().uuid(),
});

export const UpdateMatchSchema = z.object({
  matchId: z.string().uuid(),
  status: z.enum(["pending", "matched", "rejected"]),
});

// Type inference
export type SignUpData = z.infer<typeof SignUpSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type RefreshData = z.infer<typeof RefreshSchema>;
export type UpdateProfileData = z.infer<typeof UpdateProfileSchema>;
export type CreateMatchData = z.infer<typeof CreateMatchSchema>;
export type UpdateMatchData = z.infer<typeof UpdateMatchSchema>;

// Response Types
export interface AuthResponse {
  data: {
    session: {
      access_token: string;
      refresh_token: string;
      token_type: string;
      expires_in: number;
      expires_at: number;
    };
    user: {
      id: string;
      email: string;
      name: string;
      gender?: string;
      birthdate?: string;
      region?: string;
      course?: string;
      examDate?: string;
      partner_preferences?: any;
      bio?: string;
      is_premium: boolean;
      created_at: string;
      updated_at: string;
      examPreferences?: any;
    };
  };
}

export interface RefreshResponse {
  success: boolean;
  message: string;
  data: {
    session: {
      access_token: string;
      token_type: string;
      expires_in: number;
      expires_at: number;
      refresh_token: string;
    };
    user: {
      id: string;
      email: string;
    };
  };
  error: null;
}

export interface ProfileResponse {
  data: {
    id: string;
    name?: string;
    gender?: string;
    birthdate?: string;
    region?: string;
    course?: string;
    examDate?: string;
    partner_preferences?: {
      study_schedule?: string;
      communication_style?: string;
    };
    bio?: string;
    is_premium?: boolean;
    examPreferences?: {
      exam_id: string;
      study_start_date: string;
      study_end_date: string;
      daily_study_time: string;
      intensity: string;
    };
  };
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: string;
  status: "pending" | "matched" | "rejected";
  partner_id: string;
  partner_display_name: string;
  partner_gender: string;
  user1_profile: {
    id: string;
    full_name: string;
    gender: string;
  };
  user2_profile: {
    id: string;
    full_name: string;
    gender: string;
  };
}

export interface MatchesResponse {
  data: {
    matches: Match[];
    count: number;
  };
}

export interface PotentialMatch {
  id: string;
  user_id: string;
  exam_id: string;
  study_start_date: string;
  study_end_date: string;
  daily_study_time: string;
  intensity: string;
  created_at: string;
  full_name: string;
  gender: string | null;
  // New exam details
  exam_name: string;
  exam_category: string;
  exam_country: string;
  exam_field: string;
  match_score?: number;
  exam_match?: boolean;
  intensity_match?: boolean;
  date_overlap?: boolean;
  overlap_days?: number;
  // Nested exam object from API
  exams?: {
    id: string;
    name: string;
    field: string;
    country: string;
    category: string;
  };
}

export interface PotentialMatchesResponse {
  data: {
    success: boolean;
    matches: PotentialMatch[];
    categorized: {
      perfect: PotentialMatch[];
      excellent: PotentialMatch[];
      good: PotentialMatch[];
      potential: PotentialMatch[];
      counts: {
        perfect: number;
        excellent: number;
        good: number;
        potential: number;
        total: number;
      };
    };
    userPreferences: {
      exam_id: string;
      intensity: string;
      study_period: {
        start: string;
        end: string;
      };
    };
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      limit: number;
    };
  };
}

export interface Exam {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ExamsResponse {
  data: Exam[];
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
