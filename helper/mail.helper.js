const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const transport = nodemailer.createTransport(
  smtpTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })
);

module.exports = {
  sendForgotOTPMail: async (data) => {
    const resJSON = { "success": false, "data": null };
    try {
      const mailnOptions = {
        from: {
          name: 'Bhavy Computer Invoice Generator',
          address: process.env.EMAIL_USER
        },
        to: data.email,
        subject: "PASSOWRD RESET COFIRMATION CODE.",
        text: `You are rquired to enter the following code ${data.otp} to reset your password. OTP is valid for 30 minutes.`
      };
      transport.sendMail(mailnOptions, (err, info) => {
        if (err) {
          console.log("error on ::transport.sendMail :: fn[sendForgotOTPMail]::>", err);
          resJSON.data = err;
          return resJSON;
        } else {
          console.log("Mail is successfully send:: fn[sendForgotOTPMail]::>", info);
          resJSON.data = info;
          resJSON.success = true;
          return resJSON;
        }
      });
    } catch (error) {
      console.log("CATCH ERROR::fn[sendForgotOTPMail]", error);
      resJSON.data = error.message;
      return resJSON;
    }
  },
  sendPDFMailOnCheckout: async (data, callback) => {
    const resJSON = { "success": false, "data": null };
    try {
      const mailnOptions = {
        from: {
          name: 'Purchase Invoice',
          address: process.env.EMAIL_USER
        },
        to: data.email,
        bcc: 'pr1430378@gmail.com',
        subject: "HERE'S YOUR INVOICE! THANK YOU!",
        text: "We want to thank you for your purchase! We hope that you enjoy your documents as much as we have enjoyed generating them for you.",
        attachments: [
          {
            filename: `${data.bill_type}`,
            path: `.` + data.pdf_path,
            contentType: 'application/' + data.app_type
          }
        ]
      };
      transport.sendMail(mailnOptions, (err, info) => {
        if (err) {
          console.log("error on ::transport.sendMail:: fn[sendPDFMailOnCheckout]::>", err);
          resJSON.data = err;
          callback("error", resJSON);
        } else {
          console.log("Mail is successfully send:: fn[sendPDFMailOnCheckout]::>", info);
          resJSON.data = info;
          resJSON.success = true;
          callback("success", resJSON);
        }
      });
    } catch (error) {
      console.log("CATCH ERROR::fn[sendPDFMailOnCheckout]", error);
      resJSON.data = error.message;
      callback("error", resJSON);
    }
  },
};