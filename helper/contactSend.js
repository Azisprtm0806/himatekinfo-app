const nodemailer = require("nodemailer");

exports.contactSend = (dataEmail) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "azisprtm08@gmail.com",
      pass: "gbfe tfja vxnx jtco",
    },
  });
  return transporter.sendMail(dataEmail);
};
