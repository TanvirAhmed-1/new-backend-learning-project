import jwt, { SignOptions } from "jsonwebtoken";
import config from "../config";

export const createToken = (payload: object) => {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, config.jwt.secret as jwt.Secret, options);
};