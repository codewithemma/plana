import { StatusCodes } from "http-status-codes";
import CustomAPIError from "./custom-api";

class ConflictError extends CustomAPIError {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = StatusCodes.CONFLICT;
  }
}

export default ConflictError;
