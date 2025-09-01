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

export default projectsRoutes;
