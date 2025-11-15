import express from "express";

const app = express();


app.get("/", (req: express.Request, res: express.Response) => {
  res.send("Hello World!");
});

app.get("/health", (req: express.Request, res: express.Response) => {
  res.status(200).send("Ok api is working");
});
app.post("/health", (req: express.Request, res: express.Response) => {
  req.body.message;
  res.status(200).send("Ok api is working");
});
export default app;