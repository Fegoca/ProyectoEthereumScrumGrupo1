// Create a express app
const express = require("express");

// accept cors
const cors = require("cors");

// https://expressjs.com/en/resources/middleware/morgan.html
const morgan = require("morgan");

// Express server
const app = express();
const port = 3000;

const networks = require("./router-network");

// use middlewares to parse json and urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("combined"));
// use cors
app.use(cors());

// post request
app.post("/post", (req, res) => {
  console.log(req.body);
  res.send("POST request to the homepage");
});

app.use("/network", networks);

// route not found
app.use("*", (req, res) => {
  res.status(404).send("NOT FOUND ");
});

app.listen(port, () => {
  console.log("Server started on port 3000");
});
