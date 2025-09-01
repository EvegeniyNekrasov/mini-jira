import "dotenv/config";
import express from "express";
import morgan from "morgan";
import session from "express-session";
import path from "path";
import SQLiteStoreInit from "connect-sqlite3";
import helmet from "helmet";
import compression from "compression";
import csrf from "csurf";
import { exposeLocals } from "@lib/auth";
const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Views
app.set("views", path.join(process.cwd(), "src", "views"));
app.set("view engine", "ejs");

// Middlewares
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static
app.use(express.static(path.join(process.cwd(), "public")));

// Sessions
const SQLiteStore = SQLiteStoreInit(session);
app.use(
    session({
        store: new SQLiteStore({
            db: "sessions.sqlite",
            dir: path.join(process.cwd(), ".data"),
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

app.get("/", (req, res) => {
    res.json({ message: "hi" });
});
app.listen(PORT, () =>
    console.log(`MINI JIRA: listening on http://localhost:${PORT}`)
);
