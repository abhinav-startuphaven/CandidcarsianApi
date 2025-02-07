// import express from "express";
// import bodyParser from "body-parser";
// import nodemailer from "nodemailer";
// import { google } from "googleapis";
// import cors from 'cors';
// import dotenv from "dotenv";

// dotenv.config({ path: "./.env" });

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.use(bodyParser.json());
// app.use(cors());

// app.post("/store-data", async (req, res) => {
//   const { userName, userEmail, emailBody } = req.body;

//   const auth = new google.auth.GoogleAuth({
//     keyFile: "credentials.json",
//     scopes: "https://www.googleapis.com/auth/spreadsheets",
//   });

//   const client = await auth.getClient();
//   const googleSheets = google.sheets({ version: "v4", auth: client });
//   const spreadsheetId = "17pLRfvlgYvWvEqV5T8Zrm8xPreDJ4-kw3NhcYiDRKHU";

//   try {
//     await googleSheets.spreadsheets.values.append({
//       auth,
//       spreadsheetId,
//       range: "Sheet1!A:D",
//       valueInputOption: "USER_ENTERED",
//       resource: {
//         values: [[userName, userEmail, emailBody, "false"]],
//       },
//     });
//     res.status(200).json({ success: true, message: "Data stored successfully!" });
//   } catch (error) {
//     console.error("Error storing data in Google Sheets:", error);
//     res.status(500).json({ success: false, message: "Failed to store data." });
//   }
// });

// app.get("/send-emails", async (req, res) => {
//   const auth = new google.auth.GoogleAuth({
//     keyFile: "credentials.json",
//     scopes: "https://www.googleapis.com/auth/spreadsheets",
//   });

//   const client = await auth.getClient();
//   const googleSheets = google.sheets({ version: "v4", auth: client });
//   const spreadsheetId = "17pLRfvlgYvWvEqV5T8Zrm8xPreDJ4-kw3NhcYiDRKHU";

//   try {
//     const getRows = await googleSheets.spreadsheets.values.get({
//       auth,
//       spreadsheetId,
//       range: "Sheet1!A2:D",
//     });

//     const rows = getRows.data.values;

//     if (!rows || rows.length === 0) {
//       return res.status(200).json({ success: false, message: 'No data found in the spreadsheet.' });
//     }

//     let transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_ID,
//         pass: process.env.EMAIL_PASSWORD,
//       },
//     });

//     for (const [index, row] of rows.entries()) {
//       const [userName, userEmail, emailBody, emailSent] = row;

//       if (emailSent === "TRUE") {
//         continue;
//       }

//       let mailOptions = {
//         from: process.env.EMAIL_ID,
//         to: userEmail,
//         subject: "Hello",
//         text: emailBody,
//         html: `<b>Hello ${userName},</b><br>${emailBody}`,
//       };

//       try {
//         await transporter.sendMail(mailOptions);
//         console.log(`Email sent to ${userEmail}`);

//         // Update the "Email Sent" status to "true"
//         await googleSheets.spreadsheets.values.update({
//           auth,
//           spreadsheetId,
//           range: `Sheet1!D${index + 2}`,
//           valueInputOption: "USER_ENTERED",
//           resource: {
//             values: [["true"]],
//           },
//         });
//       } catch (error) {
//         console.error(`Failed to send email to ${userEmail}:`, error);
//       }
//     }

//     res.status(200).json({ success: true, message: 'Emails sent successfully.' });
//   } catch (error) {
//     console.error("Error reading data from Google Sheets:", error);
//     res.status(500).json({ success: false, message: "Failed to send emails." });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// server.js

import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const app = express();

// Middleware
app.use(
  cors({
    origin: "https://detailinglab.co.in",
    credentials: true,
  })
);
app.use(express.json());

// Create transporter with updated configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587, // Changed from 465 to 587 for TLS
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Helps avoid certificate issues
  },
});

// Verify transporter connection
transporter.verify(function (error, success) {
  if (error) {
    console.log("Server connection error: ", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/api/contactus", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    // Email options
    const mailOptions = {
      from: {
        name: name,
        address: process.env.EMAIL_USER,
      },
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
      replyTo: email,
    };

    // Send email
    transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: `Failed to send email: ${error.message}` });
  }
});

app.post("/api/appointment", async (req, res) => {
  try {
    const { name, email, Phone, VehicleBrand, VehicleModel, selectedDate } =
      req.body;
    console.log(req.body, "req.body");
    console.log(name, email, Phone, VehicleBrand, VehicleModel, selectedDate);
    if (
      !name ||
      !email ||
      !Phone ||
      !VehicleBrand ||
      !VehicleModel ||
      !selectedDate
    ) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields " });
    }

    // Email options
    const mailOptions = {
      from: {
        name: name,
        address: process.env.EMAIL_USER,
      },
      to: process.env.EMAIL_USER,
      subject: `New Appointment Form Message from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone number:</strong> ${Phone}</p>
        <p><strong>Vehicle Brand:</strong> ${VehicleBrand}</p>
        <p><strong>Vehicle Model:</strong> ${VehicleModel}</p>
        <p><strong>Date:</strong> ${selectedDate} </p>
        
      `,
      replyTo: email,
    };

    // Send email
    transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: `Failed to send email: ${error.message}` });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
