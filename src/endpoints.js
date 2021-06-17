const express = require("express");
const mongoose = require("mongoose");
const router = new express.Router();
let isConnectionEstablished = false;
let Person;
let schema;
let dailyNoteSchema;
let DailyNotes;

// Login Page and Logout  Functionality

router.get("/", mongoDbConnectionMiddleware, (request, response) => {
 if (request.cookies.name) {
  response.render("dailyNotes", {
   un: request.cookies.name[0],
   search_Notes_Div_Display: "none",
   add_Notes_Div_Display: "block",
   display: "hidden",
  });
 } else {
  response.render("login", { display: "hidden" });
 }
});

router.post("/login", async (request, response, next) => {
 try {
  const result = await mongoDbCrud("login", request);
  if (result) {
   response.cookie("name", request.body.usernameLogin);
   response.redirect("/");
  } else {
   response.render("login", {
    success: "invalid username/password",
    display: "visible",
    alert_type: "alert-danger",
   });
  }
 } catch (error) {
  next(error);
 }
});

router.post("/registration", async (request, response, next) => {
 try {
  const result = await mongoDbCrud("registration", request);
  response.render("login", {
   success: result == undefined ? "Registration SuccessFul" : "The username is already taken",
   display: "visible",
   alert_type: result == undefined ? "alert-success" : "alert-danger",
  });
 } catch (error) {
  next(error);
 }
});

router.get("/logout", async (request, response, next) => {
 response.clearCookie("name");
 response.redirect("/");
});

// Login Page and Logout  Functionality

// Daily Notes  Functionality

router.post("/new_Note", async (request, response) => {
 try {
  await mongoDbCrud("new_Note", request);
  response.render("dailyNotes", {
   un: request.cookies.name[0],
   search_Notes_Div_Display: "none",
   add_Notes_Div_Display: "block",
   success: "Successfully Note Added",
   display: "visible",
   alert_type: "alert-success",
  });
 } catch (error) {
  next(error);
 }
});

router.get("/view_Notes", async (request, response, next) => {
 try {
  if (!request.cookies.name) {
   response.redirect("/");
  }
  const result = await mongoDbCrud("view_Notes", request);
  response.render("dailyNotes", {
   result,
   un: request.cookies.name[0],
   search_Notes_Div_Display: "block",
   add_Notes_Div_Display: "none",
   display: "hidden",
  });
 } catch (error) {
  next(error);
 }
});

router.post("/update_Note", async (request, response, next) => {
 try {
  const result = await mongoDbCrud("update_Note", request);
  const resultData = await mongoDbCrud("view_Notes", request);
  response.render("dailyNotes", {
   result: resultData,
   un: request.cookies.name[0],
   search_Notes_Div_Display: "block",
   add_Notes_Div_Display: "none",
   success: result == "Update" ? "Successfully Note Updated" : "Successfully Note Deleted",
   display: "visible",
   alert_type: "alert-success",
  });
 } catch (error) {
  next(error);
 }
});

router.get("*", async (request, response, next) => {
 response.redirect("/");
});

// Daily Notes  Functionality

const connectMongoose = async () => {
 try {
  await mongoose.connect("mongodb://localhost:27017/mongoDbCrud", { useNewUrlParser: true, useUnifiedTopology: true });
  isConnectionEstablished = true;
 } catch (error) {}
};

async function mongoDbCrud(operation, request) {
 if (!schema && !Person && !dailyNoteSchema && !DailyNotes) {
  schema = new mongoose.Schema({
   username: { type: String, isrequired: true },
   password: { type: String, isrequired: true },
  });
  Person = new mongoose.model("Person", schema);

  dailyNoteSchema = new mongoose.Schema({
   username: { type: String, isrequired: true },
   date: { type: Date, isrequired: true },
   title: { type: String, isrequired: true },
   detail: { type: String, isrequired: true },
  });
  DailyNotes = new mongoose.model("DailyNotes", dailyNoteSchema);
 }
 let result;
 switch (operation) {
  case "login":
   result = await Person.findOne({ username: request.body.usernameLogin, password: request.body.pswdLogin });
   return result;
  case "registration":
   result = await Person.findOne({ username: request.body.usernameRegister });
   if (result != null) {
    return result;
   } else {
    const PersonObject = new Person({ username: request.body.usernameRegister, password: request.body.pswdRegister });
    await Person.insertMany([PersonObject]);
   }
   break;
  case "new_Note":
   const DailyNotesObject = new DailyNotes({
    username: request.cookies.name,
    date: request.body.date,
    title: request.body.title,
    detail: request.body.detail,
   });
   await DailyNotes.insertMany([DailyNotesObject]);
   break;
  case "view_Notes":
   let mongoData = await DailyNotes.find({ username: request.cookies.name }, { date: 1, title: 1, detail: 1, _id: 0 }).sort({
    date: -1,
   });
   let data = [];
   for (const document of mongoData) {
    data.push({ date: document.date, title: document.title, detail: document.detail });
   }
   //  result = "";
   //  for (const document of data) {
   //   result = result.concat("<tr>");
   //   let rowTd = "";
   //   for (const element in document) {
   //    rowTd = rowTd.concat("<td>" + (document[element] ? document[element] : "") + "</td>");
   //   }
   //   result = result.concat(rowTd + "</tr>");
   //  }
   //  console.log("MyResult");
   return data;

  case "update_Note":
   const operationData = request.body.Update_Delete.split(",");
   if (operationData[0] == "Update") {
    await DailyNotes.updateOne(
     { username: request.cookies.name, date: operationData[1] },
     { $set: { title: request.body.title, detail: request.body.detail } }
    );
   } else {
    await DailyNotes.deleteOne({ username: request.cookies.name, date: operationData[1] });
   }
   return operationData[0];
 }
}

async function mongoDbConnectionMiddleware(request, response, next) {
 if (!isConnectionEstablished) {
  await connectMongoose();
 }

 if (!isConnectionEstablished) next(new Error("Failed to establish connection to MongoDb"));

 next();
}

module.exports = router;
