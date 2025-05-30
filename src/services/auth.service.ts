import bcrypt from "bcrypt";
const SALT_ROUNDS = 11; // 控制 bcrypt 生成盐的复杂度（轮数）
import { signToken } from "@/utils/jwt";
import { auth } from "@/models";
import { IUser } from "@/interface";
import { error } from "@/utils/";

// 工具函数，获取可暴露的user属性
const getExportUser = (user: IUser | null) => {
  return {
    id: user?.id,
    name: user?.name,
    email: user?.email,
  };
};

export const register = async ({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) => {
  const exist = await auth.User.findOne({
    where: { email },
  });
  if (exist) error.throwError("用户已存在❌");
  const userRole = await auth.Role.findOne({
    where: { name: "User" },
    include: [
      {
        model: auth.Permission,
        through: {
          attributes: [],
        },
      },
    ],
  });
  if (!userRole) error.throwError("用户所需角色不存在，请联系管理员❌");
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await auth.User.create({
    name,
    email,
    password: hashedPassword,
  });
  await user.setRoles([userRole]);
  const userPlain = user.get({ plain: true });
  const rolePlain = userRole.get({ plain: true });
  const token = signToken({ userId: userPlain.id });
  return {
    user: { ...getExportUser(userPlain), Roles: [rolePlain] },
    token,
  };
};

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const user = await auth.User.findOne({
    where: { email },
    include: [
      {
        model: auth.Role,
        through: {
          attributes: [],
        },
        include: [
          {
            model: auth.Permission,
            through: {
              attributes: [],
            },
          },
        ],
      },
    ],
  });
  if (!user) error.throwError("该用户不存在，请注册❌");
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) error.throwError("密码错误❌");
  const exportUserData = getExportUser(user);
  const token = signToken(exportUserData);
  return {
    user: exportUserData,
    token,
  };
};
