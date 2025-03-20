
export interface ApiError {
  message: string;
  status: string | number;
  timestamp: string;
  url: string;
  error: any;
}