export type ActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: Record<string, string>;
  devUrl?: string;
  devOtp?: string;
  email?: string;
  retryAfterSeconds?: number;
};

export const initialActionState: ActionState = { status: "idle" };
