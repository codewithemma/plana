import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { isTokenValid } from "../utils/jwt";
import UnauthenticatedError from "../errors/unauthenticated-error";
import attachCookiesToResponse from "../utils/jwt";

const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { planaAtoken, planaRtoken } = req.signedCookies;

  try {
    if (planaAtoken) {
      const payload = isTokenValid(planaAtoken);
      req.user = payload.user;
      return next();
    }

    // check for refreshtoken
    const payload = isTokenValid(planaRtoken);

    const existingRefreshToken = await prisma.token.findFirst({
      where: {
        userId: payload.user._id,
        refreshToken: payload.refreshToken,
      },
    });

    if (!existingRefreshToken || !existingRefreshToken?.isValid) {
      throw new UnauthenticatedError("Authentication Invalid");
    }
    attachCookiesToResponse({
      res,
      user: payload.user,
      refreshToken: existingRefreshToken.refreshToken,
    });
    req.user = payload.user;
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication Invalid");
  }
};

// const authorizePermissions = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       throw new CustomError.UnauthorizedError(
//         "Unauthorized to access this route"
//       );
//     }
//     next();
//   };
// };

export default authenticateUser;
