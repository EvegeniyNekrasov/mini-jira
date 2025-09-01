import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";

export const hashPassword = async (plainPswd: string) =>
    bcrypt.hash(plainPswd, 10);

export const verifyPassword = async (plainPswd: string, hash: string) =>
    bcrypt.compare(plainPswd, hash);

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (req.session.user) return next();
    if (req.get("HX-Request")) {
        res.setHeader("HX-Request", "/auth/login");
        return res.status(401).end();
    }
    res.redirect("/auth/login");
}

export function exposeLocals(req: Request, res: Response, next: NextFunction) {
    res.locals.csrfToken = req.csrfToken?.() ?? "";
    res.locals.user = req.session.user ?? null;
    next();
}

declare module "express-session" {
    interface SessionData {
        user?: { id: string; email: string; name: string };
    }
}
