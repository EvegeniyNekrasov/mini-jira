import { Router } from "express";
import { prisma } from "@lib/db";
import { requireAuth } from "@lib/auth";

const boardRoutes = Router();
boardRoutes.use(requireAuth);

boardRoutes.get("/:projectId/board", async (req, res) => {
    const project = await prisma.project.findFirst({
        where: { id: req.params.projectId, ownerId: req.session.user!.id },
    });
    if (!project) return res.status(404).send("Proyecto no encontrado");
    const issues = await prisma.issue.findMany({
        where: { projectId: project.id },
        orderBy: [{ status: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    });
    res.render("board/show", { project, issues });
});

boardRoutes.post("/:projectId/issues", async (req, res) => {
    const { title, description } = req.body as {
        title: string;
        description: string;
    };
    const projectId = req.params.projectId;
    const issue = await prisma.issue.create({
        data: {
            title,
            description,
            projectId,
            reporterId: req.session.user!.id,
            order: Date.now(),
        },
    });
    res.render("board/_issue_card", { issue });
});

boardRoutes.put("/issues/:id/status", async (req, res) => {
    const { status } = req.body as { status: "TODO" | "IN_PROGRESS" | "DONE" };
    const issue = await prisma.issue.update({
        where: { id: req.params.id },
        data: { status },
    });
    res.render("board/_issue_card", { issue });
});

export default boardRoutes;
