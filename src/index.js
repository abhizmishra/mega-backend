// require('dotenv').config({path:'./env'})
import { app } from "./app.js";
import "dotenv/config";
import connectDB from "./db/index.js";
import { configDotenv } from "dotenv";
configDotenv({
  path: "./env",
});
//for database conection which is written in db folder index.js
connectDB()
  .then(() => {
    //for start the server
    app.listen(process.env.PORT, () => {
      console.log(`Server is running at port : ${process.env.PORT}`);
    });
  })
  // if db not connected to server
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });

// First approch to connect database
// import mongoose from "mongoose";

// import { DB_NAME } from "./constants";
// import express from "express";
// const app = express()

//   ( async () => {
//     try {
//       await mongoose.connect(`${process.env.MONOGODB_URI}/${DB_NAME}`)

//       app.on("error", (error) => {
//         console.error("Error occurred", error);
//         throw error
//       })
//       app.listen(process.env.PORT, () => {
//         console.log(`App is listening on port ${process.env.PORT}`);
//       })
//     }
//     catch (error) {
//       console.error("Error: ", error)
//       throw error
//     }
// })  ()
