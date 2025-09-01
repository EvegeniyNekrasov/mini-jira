import { requireAuth } from "@lib/auth";
import { prisma } from "@lib/db";
import { Router } from "express";

const projectsRoutes = Router();
projectsRoutes.use(requireAuth);

projectsRoutes.get("/", async (req, res) => {
    const projects = await prisma.project.findMany({
        where: { ownerId: req.session.user?.id },
        orderBy: { createdAt: "desc" },
    });
    res.render("projects/index", { projects });
});

projectsRoutes.get("/new", (req, res) => {
    if (req.query.close) return res.send("");
    res.render("projects/_create_form");
});

projectsRoutes.post("/", async (req, res) => {
    const { name, key } = req.body as { name: string; key: string };
    const proj = await prisma.project.create({
        data: { name, key, ownerId: req.session.user!.id },
    });
    res.render("projects/create_response", { project: proj });
});

export default projectsRoutes;
