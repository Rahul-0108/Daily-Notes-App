const express = require("express");
const path = require("path");
const router = require("./endpoints");
const app = express();
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

const staticFilePath = path.join(__dirname, "./public");
const newFolderPath = path.join(__dirname, "./views");

app.use(express.static(staticFilePath));
app.set("view engine", "hbs");
app.set("views", newFolderPath);
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());
app.use(cookieParser());

app.use(router);
app.use((error, request, response, next) => {
 console.log("Error");
 response.status(400).send("DataBase is causing the error");
});

app.listen("8000", () => console.log("listening on port 8000"));
