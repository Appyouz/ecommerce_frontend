import { User } from "./user";
// This interface reflects the full response from /dj-rest-auth/login/ endpoint
export interface LoginResponseWithTokens {
  user: User;
  access: string;
  refresh: string;
}
