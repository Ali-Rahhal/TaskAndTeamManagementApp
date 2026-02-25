import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from "../utils/jwt.js";

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

    const sessionId = crypto.randomUUID(); // this is jti

    const accessToken = signAccessToken({
      userId: user.id,
      sysRole: user.sysRole,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      jti: sessionId,
    });

    await prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
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
    let decoded: any;

    try {
      decoded = verifyToken(refreshToken);
    } catch {
      throw new Error("Invalid refresh token");
    }

    const session = await prisma.session.findUnique({
      where: { id: decoded.jti },
      include: { User: true },
    });

    if (!session) throw new Error("Invalid refresh token");

    if (session.expiresAt < new Date()) {
      throw new Error("Refresh token expired");
    }

    const accessToken = signAccessToken({
      userId: session.userId,
      sysRole: session.User.sysRole,
    });

    return { accessToken };
  },

  async logout(refreshToken: string) {
    let decoded: any;

    try {
      decoded = verifyToken(refreshToken);
    } catch {
      throw new Error("Invalid refresh token");
    }

    await prisma.session.delete({
      where: { id: decoded.jti },
    });
  },
};
