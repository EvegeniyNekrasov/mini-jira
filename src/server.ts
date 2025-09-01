import "dotenv/config";
import express from "express";
import fs from "node:fs";
import morgan from "morgan";
import session from "express-session";
import ejsMate from "ejs-mate";
import path from "path";
import SQLiteStoreInit from "connect-sqlite3";
import crypto from "node:crypto";
import helmet from "helmet";
import compression from "compression";
import csrf from "csurf";
import { exposeLocals } from "@lib/auth";
import projectsRoutes from "@routes/projects";
import authRouter from "@routes/auth";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Views
app.engine("ejs", ejsMate);
app.set("views", path.join(process.cwd(), "src", "views"));
app.set("view engine", "ejs");

app.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString("base64");
    next();
});

// Middlewares
app.use(helmet({ contentSecurityPolicy: false }));

app.use((req, res, next) => {
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                `'nonce-${res.locals.cspNonce}'`,
                "https://cdn.tailwindcss.com",
                "https://unpkg.com",
                "https://cdn.jsdelivr.net",
            ],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "data:"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            frameAncestors: ["'self'"],
        },
    })(req, res, next);
});
app.use(compression());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static
app.use(express.static(path.join(process.cwd(), "public")));

// Sessions
const SQLiteStore = SQLiteStoreInit(session);
const dataDir = path.join(process.cwd(), ".data");
fs.mkdirSync(dataDir, { recursive: true });
app.use(
    session({
        store: new SQLiteStore({
            db: "sessions.sqlite",
            dir: dataDir,
        }),
        secret: process.env.SESSION_SECRET || "dev-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        },
    })
);

// After session CSRF
app.use(csrf());
app.use(exposeLocals);

app.get("/", (req, res) => res.redirect("/projects"));
app.use("/projects", projectsRoutes);
app.use("/auth", authRouter);

app.listen(PORT, () =>
    console.log(`MINI JIRA: listening on http://localhost:${PORT}`)
);
