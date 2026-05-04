const express = require("express");
const cors = require("cors");

const routes = require("./routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", routes);

app.get("/", (req, res) => {
  res.json({
    message: "API AmigojoLive funcionando correctamente",
  });
});

app.use(errorMiddleware);

module.exports = app;