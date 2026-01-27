import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signAccessToken, signRefreshToken } from "../utils/jwt";

export const AuthService = {
  async register(email: string, name: string, password: string) {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new Error("Email already in use");

    const passwordHash = await bcrypt.hash(password, 12);

    return prisma.user.create({
      data: { email, name, passwordHash },
      select: { id: true, email: true, name: true },
    });
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new Error("Invalid credentials");

    const accessToken = signAccessToken({
      userId: user.id,
      sysRole: user.sysRole,
    });
    const refreshToken = signRefreshToken({
      userId: user.id,
    });

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 86400000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  },

  async refresh(refreshToken: string) {
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { User: true },
    });
    if (!session) throw new Error("Invalid refresh token");

    const accessToken = signAccessToken({
      userId: session.userId,
      sysRole: session.User.sysRole,
    });
    return { accessToken };
  },

  async logout(refreshToken: string) {
    await prisma.session.deleteMany({
      where: { refreshToken },
    });
  },
};
