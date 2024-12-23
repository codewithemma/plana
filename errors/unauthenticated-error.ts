import { StatusCodes } from "http-status-codes";
import CustomAPIError from "./custom-api";

class UnauthenticatedError extends CustomAPIError {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}

export default UnauthenticatedError;
