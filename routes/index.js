var express = require("express");
var router = express.Router();
const nodemailer = require("nodemailer");
const Post = require("../model/Post");
const ComingSoon = require("../model/ComingSoon");
const Divisi = require("../model/Divisi");
const Proker = require("../model/Prokers");
const VisiMisi = require("../model/visiMisi");

/* GET home page. */
router.get("/", async function (req, res, next) {
  const alertMessage = req.flash("alertMessage");
  const alertStatus = req.flash("alertStatus");
  const alert = {
    message: alertMessage,
    status: alertStatus,
  };
  const post = await Post.find().sort({ date: -1 }).limit(3);
  // const comingSoon = await ComingSoon.find().sort({ date: -1 }).limit(1);
  const visiMisi = await VisiMisi.find().sort({ date: -1 }).limit(1);
  const proker = await Proker.find();
  const comingSoon = await ComingSoon.findOne({ status: "aktif" });
  const bphDesc = await Divisi.findOne({ namaDivisi: "Badan Pengurus Harian" });
  const ristekDesc = await Divisi.findOne({
    namaDivisi: "Riset dan Teknologi",
  });
  const sbmDesc = await Divisi.findOne({
    namaDivisi: "Sosial Budaya Mahasiswa",
  });
  const kominfoDesc = await Divisi.findOne({
    namaDivisi: "Komunikasi dan Informasi",
  });
  const inrohDesc = await Divisi.findOne({
    namaDivisi: "Intelektual dan Kerohanian",
  });
  const sekretDesc = await Divisi.findOne({ namaDivisi: "Kesekretariatan" });

  const divisi = {
    bph: bphDesc.deskripsi,
    ristek: ristekDesc.deskripsi,
    sbm: sbmDesc.deskripsi,
    kominfo: kominfoDesc.deskripsi,
    inroh: inrohDesc.deskripsi,
    sekret: sekretDesc.deskripsi,
  };

  res.render("index", {
    visiMisi,
    post,
    comingSoon,
    proker,
    alert,
    divisi,
  });
});
// Data Postingan
router.get("/post", async function (req, res, next) {
  const post = await Post.find().sort({ date: -1 }).limit(12);
  res.render("partialsLanding/postingan/dataPostingan", {
    post,
  });
});
// detail postingan
router.get("/post-detail/:id", async function (req, res, next) {
  const { id } = req.params;
  const detailPost = await Post.findById({ _id: id });
  res.render("partialsLanding/postingan/detailPostingan", {
    detailPost,
  });
});
// divisi
router.get("/divisi-bph", async function (req, res, next) {
  const bph = await Divisi.findOne({ namaDivisi: "Badan Pengurus Harian" });
  res.render("partialsLanding/dataDivisi", {
    action: "bph",
    bph,
  });
});

router.get("/divisi-ristek", async function (req, res, next) {
  const ristek = await Divisi.findOne({ namaDivisi: "Riset dan Teknologi" });
  res.render("partialsLanding/dataDivisi", {
    action: "ristek",
    ristek,
  });
});

router.get("/divisi-kominfo", async function (req, res, next) {
  const kominfo = await Divisi.findOne({
    namaDivisi: "Komunikasi dan Informasi",
  });
  res.render("partialsLanding/dataDivisi", {
    action: "kominfo",
    kominfo,
  });
});

router.get("/divisi-sbm", async function (req, res, next) {
  const sbm = await Divisi.findOne({ namaDivisi: "Sosial Budaya Mahasiswa" });
  res.render("partialsLanding/dataDivisi", {
    action: "sbm",
    sbm,
  });
});

router.get("/divisi-inroh", async function (req, res, next) {
  const inroh = await Divisi.findOne({
    namaDivisi: "Intelektual dan Kerohanian",
  });
  res.render("partialsLanding/dataDivisi", {
    action: "inroh",
    inroh,
  });
});

router.get("/divisi-sekret", async function (req, res, next) {
  const sekret = await Divisi.findOne({
    namaDivisi: "Kesekretariatan",
  });
  res.render("partialsLanding/dataDivisi", {
    action: "sekret",
    sekret,
  });
});

router.post("/send-contact", async (req, res, next) => {
  try {
    const output = `
    <p>Kamu Mempunyai Pesan Baru</p>
    <h3>Kontak Detail</h3>
    <ul>
      <li>Nama: ${req.body.nama}</li>
      <li>email: ${req.body.email}</li>
      <li>subjek: ${req.body.subjek}</li>
    </ul>
    <h3>Pesan</h3>
    <p>${req.body.pesan}</p>
  `;

    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "himatekinfo001@gmail.com",
        pass: "igdzxhjhuhntovbh",
      },
    });

    let mailOptions = {
      from: '"Himatekinfo Contact" <himatekinfo001@gmail.com>',
      to: "himatekinfo001@gmail.com",
      subject: `${req.body.subjek}`,
      text: "Hello world?",
      html: output,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      // console.log(`Message sent : %s`, info.messageId);
      req.flash("alertMessage", `Pesan Anda Terkirim.`);
      req.flash("alertStatus", "success");
      res.redirect("/");
      // console.log(`Previes URL: %s`, nodemailer.getTestMessageUrl(info));
    });
  } catch (error) {
    req.flash("alertMessage", `${error.message}`);
    req.flash("alertStatus", "danger");
    res.redirect("/");
  }
});

router.post("/test", (req, res) => {
  console.log(req.body);
});

module.exports = router;
