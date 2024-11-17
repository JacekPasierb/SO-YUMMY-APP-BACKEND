import Subscribe, { ISubscribe } from "../models/subscribe";

interface SubscribeParams {
  owner?: string;
  email?: string;
  body?: Record<string, any>;
}

const getSubscribeByOwner = async ({
  owner,
}: SubscribeParams): Promise<ISubscribe | null> => {
  try {
    return await Subscribe.findOne({ owner });
  } catch (error) {
    console.error("Error fetching subscription by owner:", error);
    return null;
  }
};

const getSubscribeByEmail = async ({
  email,
}: SubscribeParams): Promise<ISubscribe | null> => {
  try {
    return await Subscribe.findOne({ email });
  } catch (error) {
    console.error("Error fetching subscription by email:", error);
    return null;
  }
};

const createSubscribe = async ({
  body,
  owner,
}: SubscribeParams): Promise<ISubscribe | null> => {
  try {
    return await Subscribe.create({
      ...body,
      owner,
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return null;
  }
};

export { getSubscribeByOwner, getSubscribeByEmail, createSubscribe };
