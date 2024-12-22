import { Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../types/userType";
import BadRequestError from "../errors/bad-request";

interface Payload {
  user: User;
  refreshToken?: string;
}

const createJWT = ({ payload }: { payload: Payload }): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!); // Use non-null assertion (!) for `process.env.JWT_SECRET`.
};

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new BadRequestError("JWT_SECRET is not defined");
}

export const isTokenValid = (token: string) => {
  jwt.verify(token, secret) as jwt.JwtPayload;
};

const attachCookieToResponse = ({
  res,
  user,
  refreshToken,
}: {
  res: Response;
  user: User;
  refreshToken: string;
}): void => {
  const accessTokenJWT = createJWT({ payload: { user } });
  const refreshTokenJWT = createJWT({ payload: { user, refreshToken } });

  const oneDay = 1000 * 60 * 60 * 24;
  const thirtyDays = oneDay * 30;

  res.cookie("planaAtoken", accessTokenJWT, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });

  res.cookie("planaRtoken", refreshTokenJWT, {
    httpOnly: true,
    expires: new Date(Date.now() + thirtyDays),
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

export default attachCookieToResponse;
