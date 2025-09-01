import { hashPassword, verifyPassword } from "@lib/auth";
import { prisma } from "@lib/db";
import { Router } from "express";

const authRoutes = Router();

authRoutes.get("/login", (_req, res) => {
    res.render("auth/login");
});

authRoutes.post("/login", async (req, res) => {
    const { email, password } = req.body as { email: string; password: string };
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
        return res
            .status(401)
            .render("auth/login", { error: "Wrong credentials" });
    }

    req.session.user = { id: user.id, email: user.email, name: user.name };
    if (req.get("HX-Request")) {
        res.setHeader("HX-Redirect", "/projects");
        return res.status(200).end();
    }
    res.redirect("/projects");
});

authRoutes.get("/register", (_req, res) => res.render("auth/register"));

authRoutes.post("/register", async (req, res) => {
    const { name, email, password } = req.body as {
        name: string;
        email: string;
        password: string;
    };
    const exist = await prisma.user.findUnique({ where: { email } });
    if (exist)
        return res
            .status(400)
            .render("auth/register", { error: "Email all ready used" });
    const passwordHash = await hashPassword(password);
    await prisma.user.create({ data: { name, email, passwordHash } });
    if (req.get("HX-Request")) {
        res.setHeader("HX-Redirect", "/auth/login");
        return res.end();
    }
    res.redirect("/auth/login");
});

authRoutes.post("/logout", (req, res) => {
    req.session.destroy(() => {
        if (req.get("HX-Request")) {
            res.setHeader("HX-Redirect", "/auth/login");
            return res.end();
        }
        res.redirect("/auth/login");
    });
});

export default authRoutes;
