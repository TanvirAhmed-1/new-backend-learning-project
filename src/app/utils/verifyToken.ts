import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";

const verifyToken = (authToken: string) => {
  if (!authToken) {
    throw new Error("Unauthorized Access");
  }

  const token = authToken.split(" ")[1];

  const decoded = jwt.verify(
    token,
    config.jwt.secret as string,
  ) as JwtPayload;

  if (!decoded) {
    throw new Error("Unauthorized Access");
  }

  return decoded;
};

export default verifyToken;
