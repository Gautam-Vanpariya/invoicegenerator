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
        // bcc: '',
        subject: "Purchase Invoice",
        text: `Dear ${data.customerName},

        We're overjoyed to reach out to you today and extend our sincerest thanks for choosing Bhavy Computer. It's customers like you who make what we do so rewarding!
        
        Your recent purchase from Bhavy Computer means the world to us. We've attached your invoice for easy reference. We hope you find it in perfect order.
        
        Your support fuels our passion for providing exceptional products/services and top-notch customer service. We're here for you every step of the way, whether it's answering questions, offering recommendations, or simply sharing in your excitement.
        
        Feel free to reach out to us anytime if there's anything we can assist you with. We're always eager to lend a helping hand!
        
        Thank you once again for choosing Bhavy Computer. We can't wait to serve you again soon!
        
        Warm regards,
      
        Mr. Jasmin Baldha
        CEO - Bhavy Computer
        Bhilad - 396105
        +91 9879542139`,
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