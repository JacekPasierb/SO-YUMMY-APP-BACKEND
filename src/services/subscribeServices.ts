import Subscribe, { ISubscribe } from "../models/subscribe";

interface SubscribeParams {
  owner?: string;
  email?: string;
  body?: Record<string, any>;
}

const findSubscribe = async (
  query: SubscribeParams
): Promise<ISubscribe | null> => {
  try {
    return await Subscribe.findOne(query);
  } catch (error) {
    console.error("Error fetching subscription:", error);
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

export { findSubscribe, createSubscribe };
