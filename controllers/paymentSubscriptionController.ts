import { Request, Response } from "express";

const initiatePayment = async (req: Request, res: Response) => {
  res.send("make payment");
};

const verifyPayment = async (req: Request, res: Response) => {
  res.send("make payment");
};

export { initiatePayment, verifyPayment };
