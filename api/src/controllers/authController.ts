import type { Request, Response } from "express";
import { AuthService } from "../services/authService";

export const AuthController = {
  async register(req: Request, res: Response) {
    try {
      const { email, name, password } = req.body;
      const user = await AuthService.register(email, name, password);
      res.status(201).json(user);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 86400000,
      });

      res.json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  },

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) throw new Error("No refresh token");

      const data = await AuthService.refresh(refreshToken);
      res.json(data);
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  },

  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      res.clearCookie("refreshToken");
      res.json({ ok: true });
    } catch {
      res.status(500).json({ error: "Logout failed" });
    }
  },
};
