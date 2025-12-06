import { apiClient } from "@/lib/api-client";

export enum VerificationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  userName: string;
  avatar?: string;
  country?: string;
  city?: string;
}

export interface IVerification {
  _id: string;
  userId: IUser;
  country: string;
  institutionName: string;
  idCardImage: string;
  status: VerificationStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface AdminGetVerificationsResponse {
  data: IVerification[];
  meta: VerificationMeta;
}

export interface UpdateVerificationStatusPayload {
  status: VerificationStatus;
  rejectionReason?: string;
}

export interface MyVerificationStatus {
  hasApplication: boolean;
  status: VerificationStatus | null;
  message?: string;
}

const verificationService = {
  // Admin: Get all verification applications
  adminGetAllVerifications: async (params?: {
    page?: number;
    limit?: number;
    status?: VerificationStatus;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<AdminGetVerificationsResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.sortBy) {
      queryParams.append("sortBy", params.sortBy);
      queryParams.append("sortOrder", params.sortOrder || "desc");
    }

    console.log("Calling API with URL:", `/verify?${queryParams.toString()}`);
    const response = await apiClient.get<IVerification[]>(
      `/verify?${queryParams.toString()}`
    );
    console.log("API Response:", response);
    console.log("Response data:", response.data);
    console.log("Response meta:", response.meta);
    
    return {
      data: response.data,
      meta: response.meta as VerificationMeta || { page: 1, limit: 10, total: 0, totalPage: 0 },
    };
  },

  // Admin: Get single verification by ID
  getVerificationById: async (id: string): Promise<IVerification> => {
    const response = await apiClient.get<IVerification>(`/verify/${id}`);
    return response.data;
  },

  // Admin: Update verification status (approve/reject)
  updateVerificationStatus: async (
    id: string,
    payload: UpdateVerificationStatusPayload
  ): Promise<IVerification> => {
    const response = await apiClient.patch<IVerification>(
      `/verify/${id}/status`,
      payload
    );
    return response.data;
  },

  // User: Apply for verification
  applyForVerification: async (formData: FormData): Promise<IVerification> => {
    const response = await apiClient.post<IVerification>("/verify/apply", formData);
    return response.data;
  },

  // User: Get my verification status
  getMyVerificationStatus: async (): Promise<MyVerificationStatus> => {
    const response = await apiClient.get<MyVerificationStatus>("/verify/my-status");
    return response.data;
  },
};

export default verificationService;
