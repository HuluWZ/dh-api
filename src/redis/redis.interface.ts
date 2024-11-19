type User_Session = {
  user_id: string;
  created_at: number;
  platform: string;
  device_id: string;
  model?: string;
  ip?: string;
};

export type Session = User_Session;
export const USER_SESSION_TIMEOUT_IN_SECONDS = 2592000; // 30 days
