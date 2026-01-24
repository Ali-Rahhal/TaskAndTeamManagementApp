import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

  const token = authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload: any = verifyToken(token);
    (req as any).userId = payload.userId; //The code assigns payload.userId to the newly created userId property on the request object. This makes the user ID available throughout the request lifecycle—any subsequent middleware or route handlers can access req.userId to know who made the request.
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
