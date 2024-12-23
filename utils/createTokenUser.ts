import { User } from "../types/userType";

export const createTokenUser = (user: User) => {
  return { username: user.username, _id: user._id, role: user.role };
};
