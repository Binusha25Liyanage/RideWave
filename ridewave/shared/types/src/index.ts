export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
};

export type RideStatus = "requested" | "accepted" | "started" | "completed" | "cancelled";
