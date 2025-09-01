import "dotenv/config";
import express from "express";

const app = express();
const PORT = 6969;

app.get("/", (req, res) => {
    res.json({ message: "hi" });
});
app.listen(PORT, () => console.log("listening on http://localhost:6969"));
