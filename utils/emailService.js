const nodemailer = require('nodemailer')
const dotenv = require('dotenv');
dotenv.config();

const sendEmail = async (to, subject, text, html)=>{
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVICE,
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
      from: {
          name: "NOTIFIQ",
          address: process.env.EMAIL_ADDRESS
      }, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      html: html, // html body
  });

  console.log("Message sent: %s", info.messageId);
}

exports.sendEmail = sendEmail