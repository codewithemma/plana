import { User } from "../types/userType";

export const createTokenUser = (user: User) => {
  return { _id: user._id, username: user.username, role: user.role };
};
