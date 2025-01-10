import axios from "axios";
import BadRequestError from "../errors/bad-request";

interface Payment {
  email: string;
  amount: number;
  metadata: {
    id: string;
    username: string;
    type: string;
    quantity?: number;
  };
}

const initializePayment = async ({ email, amount, metadata }: Payment) => {
  const response = await axios.post(
    `${process.env.PAYSTACK_BASE_URL}/transaction/initialize`,
    {
      email,
      amount,
      metadata,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "content-type": "application/json",
      },
    }
  );
  return response.data;
};

const verifyPayment = async (reference: string) => {
  if (!reference) {
    throw new BadRequestError(
      "Transaction reference is required. Please provide a valid reference."
    );
  }
  const response = await axios.get(
    `${process.env.PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );
  return response.data;
};

export { initializePayment, verifyPayment };
