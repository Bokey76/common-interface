import jwt, { SignOptions } from "jsonwebtoken";
const JWT_SECRET =
  process.env.TOKEN_SECRET || "default-common-interface-secret"; // 提供默认值
type Expiration = `${number}${'s' | 'm' | 'h' | 'd' | 'y'}` | number; // 过期时间类型

// 签发token
export const signToken = (
  payload: Record<string,any>,
  expiresIn: Expiration = "7d"
): string => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET,options);
};

// 解密token
export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
