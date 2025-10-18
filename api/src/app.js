import express from "express";
import nf1Routes from "./routes/normalform1.js";
import nf2Routes from "./routes/normalform2.js";
import nf3Routes from "./routes/normalform3.js";
import nf4Routes from "./routes/normalform4.js";
import nf5Routes from "./routes/normalform5.js";

const app = express();
const port = 3000;

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/nf1", nf1Routes);
app.use("/api/nf2", nf2Routes);
app.use("/api/nf3", nf3Routes);
app.use("/api/nf4", nf4Routes);
app.use("/api/nf5", nf5Routes);

app.listen(port, () => {
  console.log("Server listening on port " + port);
});
