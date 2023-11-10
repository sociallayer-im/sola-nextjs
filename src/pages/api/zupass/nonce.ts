import { getRandomValues, hexToBigInt, toHexString } from "@pcd/util";
import { NextApiRequest, NextApiResponse } from "next";

export default async function nonceRoute(req: NextApiRequest, res: NextApiResponse) {
  try {
    res.status(200).send(hexToBigInt(
        toHexString(getRandomValues(30))
    ).toString());
  } catch (error) {
    console.error(`[ERROR] ${error}`);
    res.send(500);
  }
}
