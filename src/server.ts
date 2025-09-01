import "dotenv/config";
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middlewares
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "hi" });
});
app.listen(PORT, () =>
    console.log(`MINI JIRA: listening on http://localhost:${PORT}`)
);
