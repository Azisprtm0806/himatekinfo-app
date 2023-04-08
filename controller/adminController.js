require("dotenv").config();
const path = require("path");
const fs = require("fs-extra");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Post = require("../model/Post");
const ComingSoon = require("../model/ComingSoon");
const Divisi = require("../model/Divisi");
const Proker = require("../model/Prokers");
const VisiMisi = require("../model/visiMisi");
const Admin = require("../model/Admin");
const { kirimEmail } = require("../helper/sendEmail");

// handle error
const handleErrors = (err) => {
  let errors = { email: "", password: "" };

  // incorrret email
  if (err.message === "incorret email") {
    errors.email = "Email Tidak Terdaftar!!";
  }

  // incorrret password
  if (err.message === "incorret password") {
    errors.password = "Password Salah!!";
  }

  // validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "secret", {
    expiresIn: maxAge,
  });
};

module.exports = {
  // LOGIN
  viewLogin: (req, res) => {
    res.render("admin/auth/view_login");
  },
  actionLogin: async (req, res) => {
    const { email, password } = req.body;

    try {
      const admin = await Admin.login(email, password);
      const token = createToken(admin._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(200).json({ admin: admin._id });
    } catch (error) {
      const errors = handleErrors(error);
      res.status(400).json({ errors });
    }
  },

  // REGISTRASI
  viewRegister: async (req, res) => {
    try {
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };
      const admin = await Admin.find();
      res.render("admin/auth/view_registrasi", {
        title: "Himatekinfo | Register",
        alert,
        admin,
      });
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect(`/admin/register`);
    }
  },
  actionRegister: async (req, res) => {
    const { nama, email, password } = req.body;

    const emailAdmin = await Admin.findOne({ email: email });

    if (emailAdmin) {
      req.flash("alertMessage", "email sudah terdaftar!!");
      req.flash("alertStatus", "danger");
      res.redirect("/admin/register");
    } else {
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(password, salt);
      const admin = new Admin({
        nama: nama,
        email: email,
        password: hashPassword,
      });

      admin.save();

      req.flash("alertMessage", "Berhasil Menambahakan ADMIN!!");
      req.flash("alertStatus", "success");
      res.redirect("/admin/register");
    }
  },

  // DASHBOARD
  viewDashboard: async (req, res) => {
    const postingan = await Post.count();
    const divisi = await Divisi.count();
    const proker = await Proker.count();
    const comingSoon = await ComingSoon.count();
    res.render("admin/dashboard/view_dashboard", {
      title: "Himatekinfo | Dashboard",
      postingan,
      divisi,
      proker,
      comingSoon,
    });
  },

  dataDashboard: async (req, res) => {
    const postingan = await Post.count();
    const divisi = await Divisi.count();
    const proker = await Proker.count();
    const data = {
      postingan,
      divisi,
      proker,
    };
    try {
      res.status(200).json({
        data: data,
      });
    } catch (error) {
      console.log(err);
    }
  },

  //POSTINGAN
  viewPost: async (req, res) => {
    try {
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };
      const post = await Post.find().sort({ date: -1 });
      res.render("admin/posts/view_post", {
        title: "Himatekinfo | Post",
        alert,
        post,
      });
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect(`/admin/post`);
    }
  },
  addPost: async (req, res) => {
    try {
      const { judul, deskripsi } = req.body;
      await Post.create({
        judul,
        deskripsi,
        image: `images/${req.file.filename}`,
      });
      req.flash("alertMessage", "Postingan Berhasil di Upload!!");
      req.flash("alertStatus", "success");
      res.redirect("/admin/post");
    } catch (error) {
      console.log(error);
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/post");
    }
  },
  viewEditPost: async (req, res) => {
    const { id } = req.params;
    const post = await Post.findOne({ _id: req.params.id });
    const image = await Post.findOne({ _id: id }).populate({
      path: "image",
      select: "id image",
    });
    try {
      res.render("admin/posts/edit", {
        title: "Himatekinfo | Edit",
        post,
        image,
      });
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/post");
    }
  },
  editPost: async (req, res) => {
    try {
      const { id, judul, deskripsi } = req.body;
      const post = await Post.findOne({ _id: id });
      if (req.file == undefined) {
        post.judul = judul;
        post.deskripsi = deskripsi;
        await post.save();
        req.flash("alertMessage", "Berhasil Edit Postingan!");
        req.flash("alertStatus", "success");
        res.redirect("/admin/post");
      } else {
        await fs.unlink(path.join(`public/${post.image}`));
        post.judul = judul;
        post.deskripsi = deskripsi;
        post.image = `images/${req.file.filename}`;
        await post.save();
        req.flash("alertMessage", "Berhasil Edit Postingan!");
        req.flash("alertStatus", "success");
        res.redirect("/admin/post");
      }
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/post");
    }
  },
  viewDetailPost: async (req, res) => {
    const { id } = req.params;
    const detailPost = await Post.findById({ _id: id });
    res.render("admin/posts/detailPost", {
      title: "Himatekinfo | Detail Post",
      detailPost,
    });
  },
  deletePost: async (req, res) => {
    try {
      const { id } = req.params;
      const post = await Post.findOne({ _id: id });
      await fs.unlink(path.join(`public/${post.image}`));
      await post.remove();
      req.flash("alertMessage", "Postingan Di Hapus!");
      req.flash("alertStatus", "success");
      res.redirect("/admin/post");
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/post");
    }
  },

  // Visi Misi
  viewVisiMisi: async (req, res) => {
    try {
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };
      const visiMisi = await VisiMisi.find().sort({ date: -1 });
      res.render("admin/visiMisi/view_visiMisi", {
        title: "Himatekinfo | Visi Misi",
        alert,
        visiMisi,
      });
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect(`/admin/visi-misi`);
    }
  },
  addVisiMisi: async (req, res) => {
    const { visi, misi } = req.body;
    const dataVisi = await VisiMisi.findOne({ visi: visi });
    const dataMisi = await VisiMisi.findOne({ misi: misi });
    if (dataVisi) {
      req.flash("alertMessage", "visi Sudah Ada!!");
      req.flash("alertStatus", "danger");
      res.redirect("/admin/visi-misi");
    } else if (dataMisi) {
      req.flash("alertMessage", "misi Sudah Ada!!");
      req.flash("alertStatus", "danger");
      res.redirect("/admin/visi-misi");
    } else {
      try {
        await VisiMisi.create({
          visi,
          misi,
        });
        req.flash("alertMessage", "Visi dan Misi Berhasil Di Tambahkan!!");
        req.flash("alertStatus", "success");
        res.redirect("/admin/visi-misi");
      } catch (error) {
        console.log(error);
        req.flash("alertMessage", `${error.message}`);
        req.flash("alertStatus", "danger");
        res.redirect("/admin/visi-misi");
      }
    }
  },
  viewEditVisiMisi: async (req, res) => {
    const { id } = req.params;
    const visiMisi = await VisiMisi.findOne({ _id: req.params.id });
    try {
      res.render("admin/visiMisi/edit", {
        title: "Himatekinfo | Visi Misi",
        visiMisi,
      });
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/visi-misi");
    }
  },
  editVisiMisi: async (req, res) => {
    try {
      const { id, visi, misi } = req.body;
      const visiMisi = await VisiMisi.findOne({ _id: id });
      visiMisi.visi = visi;
      visiMisi.misi = misi;
      await visiMisi.save();
      req.flash("alertMessage", "Berhasil edit!");
      req.flash("alertStatus", "success");
      res.redirect("/admin/visi-misi");
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/vis-misi");
    }
  },
  deleteVisiMisi: async (req, res) => {
    try {
      const { id } = req.params;
      const visiMisi = await VisiMisi.findOne({ _id: id });
      await visiMisi.remove();
      req.flash("alertMessage", "Visi dan Misi Di Hapus!");
      req.flash("alertStatus", "success");
      res.redirect("/admin/visi-misi");
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/visi-misi");
    }
  },

  // Coming Soon
  comingSoonView: async (req, res) => {
    try {
      const comingSoon = await ComingSoon.find().sort({ date: -1 });
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };
      res.render("admin/coming-soon/view_CS", {
        title: "Himatekinfo | Coming-Soon",
        alert,
        comingSoon,
      });
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect(`/admin/coming-soon`);
    }
  },
  addComingSoon: async (req, res) => {
    const { judul, deskripsi, status } = req.body;
    try {
      await ComingSoon.create({
        judul,
        deskripsi,
        status,
        image: `images/${req.file.filename}`,
      });
      req.flash("alertMessage", "Coming Soon Berhasil di Upload!!");
      req.flash("alertStatus", "success");
      res.redirect("/admin/coming-soon");
    } catch (error) {
      console.log(error);
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/coming-soon");
    }
  },
  viewEditComingSoon: async (req, res) => {
    const { id } = req.params;
    const comingSoon = await ComingSoon.findOne({ _id: req.params.id });
    const image = await ComingSoon.findOne({ _id: id }).populate({
      path: "image",
      select: "id image",
    });
    try {
      res.render("admin/coming-soon/edit", {
        title: "Himatekinfo | Edit",
        comingSoon,
        image,
      });
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/coming-soon");
    }
  },
  editComingSoon: async (req, res) => {
    try {
      const { id, judul, deskripsi, status } = req.body;
      const comingSoon = await ComingSoon.findOne({ _id: id });
      if (req.file == undefined) {
        comingSoon.judul = judul;
        comingSoon.deskripsi = deskripsi;
        comingSoon.status = status;
        await comingSoon.save();
        req.flash("alertMessage", "Berhasil Edit Coming Soon!");
        req.flash("alertStatus", "success");
        res.redirect("/admin/coming-soon");
      } else {
        await fs.unlink(path.join(`public/${comingSoon.image}`));
        comingSoon.judul = judul;
        comingSoon.deskripsi = deskripsi;
        comingSoon.status = status;
        comingSoon.image = `images/${req.file.filename}`;
        await comingSoon.save();
        req.flash("alertMessage", "Berhasil Edit Coming Soon!");
        req.flash("alertStatus", "success");
        res.redirect("/admin/coming-soon");
      }
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/coming-soon");
    }
  },
  deleteComingSoon: async (req, res) => {
    try {
      const { id } = req.params;
      const comingSoon = await ComingSoon.findOne({ _id: id });
      await fs.unlink(path.join(`public/${comingSoon.image}`));
      await comingSoon.remove();
      req.flash("alertMessage", "Coming Soon Di Hapus!");
      req.flash("alertStatus", "success");
      res.redirect("/admin/coming-soon");
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/coming-soon");
    }
  },

  // DIVISI
  viewDivisi: async (req, res) => {
    try {
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };
      const divisi = await Divisi.find();
      res.render("admin/divisi/view_divisi", {
        title: "Himatekinfo | Divisi",
        alert,
        divisi,
      });
    } catch (error) {
      res.redirect("admin/divisi");
    }
  },
  addDivisi: async (req, res) => {
    const { namaDivisi, deskripsi } = req.body;
    const divisi = await Divisi.findOne({ namaDivisi: namaDivisi });
    if (divisi) {
      req.flash("alertMessage", "Divisi Sudah Ada!!");
      req.flash("alertStatus", "danger");
      res.redirect("/admin/divisi");
    } else {
      try {
        await Divisi.create({
          namaDivisi,
          image: `images/${req.file.filename}`,
          deskripsi,
        });
        req.flash("alertMessage", "Divisi Berhasil Di Tambahkan!!");
        req.flash("alertStatus", "success");
        res.redirect("/admin/divisi");
      } catch (error) {
        console.log(error);
        req.flash("alertMessage", `${error.message}`);
        req.flash("alertStatus", "danger");
        res.redirect("/admin/divisi");
      }
    }
  },
  viewEditDivisi: async (req, res) => {
    const { id } = req.params;
    const divisi = await Divisi.findOne({ _id: req.params.id });
    const image = await Divisi.findOne({ _id: id }).populate({
      path: "image",
      select: "id image",
    });
    try {
      res.render("admin/divisi/edit", {
        title: "Himatekinfo | Edit",
        divisi,
        image,
      });
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/divisi");
    }
  },
  editDivisi: async (req, res) => {
    try {
      const { id, namaDivisi, deskripsi } = req.body;
      const divisi = await Divisi.findOne({ _id: id });
      if (req.file == undefined) {
        divisi.namaDivisi = namaDivisi;
        divisi.deskripsi = deskripsi;
        await divisi.save();
        req.flash("alertMessage", "Berhasil Edit divisi!");
        req.flash("alertStatus", "success");
        res.redirect("/admin/divisi");
      } else {
        await fs.unlink(path.join(`public/${divisi.image}`));
        divisi.namaDivisi = namaDivisi;
        divisi.deskripsi = deskripsi;
        divisi.image = `images/${req.file.filename}`;
        await divisi.save();
        req.flash("alertMessage", "Berhasil Edit Postingan!");
        req.flash("alertStatus", "success");
        res.redirect("/admin/divisi");
      }
    } catch (error) {
      console.log(error);
    }
  },
  deleteDivisi: async (req, res) => {
    try {
      const { id } = req.params;
      const divisi = await Divisi.findOne({ _id: id });
      await fs.unlink(path.join(`public/${divisi.image}`));
      await divisi.remove();
      req.flash("alertMessage", "Coming Soon Di Hapus!");
      req.flash("alertStatus", "success");
      res.redirect("/admin/divisi");
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/divisi");
    }
  },

  // PROKER
  viewProker: async (req, res) => {
    try {
      const proker = await Proker.find();
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };
      res.render("admin/proker/view_proker", {
        title: "Himatekinfo | Program Kerja",
        proker,
        alert,
      });
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect(`/admin/proker`);
    }
  },
  addProker: async (req, res) => {
    const { namaProker, deskripsi } = req.body;
    const proker = await Proker.findOne({ namaProker: namaProker });
    if (proker) {
      req.flash("alertMessage", "Proker Sudah Ada!!");
      req.flash("alertStatus", "danger");
      res.redirect("/admin/proker");
    } else {
      try {
        await Proker.create({
          namaProker,
          deskripsi,
        });
        req.flash("alertMessage", "Proker Berhasil Di Tambahkan!!");
        req.flash("alertStatus", "success");
        res.redirect("/admin/proker");
      } catch (error) {
        console.log(error);
        req.flash("alertMessage", `${error.message}`);
        req.flash("alertStatus", "danger");
        res.redirect("/admin/proker");
      }
    }
  },
  viewEditProker: async (req, res) => {
    const { id } = req.params;
    const proker = await Proker.findOne({ _id: req.params.id });
    try {
      res.render("admin/proker/edit", {
        title: "Himatekinfo | Edit",
        proker,
      });
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/proker");
    }
  },
  editProker: async (req, res) => {
    try {
      const { id, namaProker, deskripsi } = req.body;
      const proker = await Proker.findOne({ _id: id });
      proker.namaProker = namaProker;
      proker.deskripsi = deskripsi;
      await proker.save();
      req.flash("alertMessage", "Berhasil edit Program Kerja!");
      req.flash("alertStatus", "success");
      res.redirect("/admin/proker");
    } catch (error) {
      console.log(error);
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/proker");
    }
  },
  deleteProker: async (req, res) => {
    try {
      const { id } = req.params;
      const proker = await Proker.findOne({ _id: id });
      await proker.remove();
      req.flash("alertMessage", "Proker Di Hapus!");
      req.flash("alertStatus", "success");
      res.redirect("/admin/proker");
    } catch (error) {
      req.flash("alertMessage", `${error.message}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/proker");
    }
  },

  // Forgot Password
  forgotPassView: (req, res) => {
    try {
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };
      res.render("admin/forgot/view_forgotPass", {
        title: "Himatekinfo | Lupa Password",
        alert,
      });
    } catch (error) {
      res.redirect("admin/divisi");
    }
  },
  actionForgotPass: async (req, res) => {
    const { email } = req.body;

    try {
      const admin = await Admin.findOne({ email: email });
      if (!admin) {
        req.flash("alertMessage", "email tidak terdaftar!!");
        req.flash("alertStatus", "danger");
        res.redirect("/admin/forgot-password");
      } else {
        const token = await jwt.sign(
          {
            idadmin: admin._id,
          },
          process.env.JSWT_SECRET
        );

        await Admin.updateOne({ resetPasswordLink: token });

        const templateEmail = {
          from: "Himatekinfo",
          to: email,
          subject: "Link Reset Password Admin",
          html: `<p>Silahkan Klik Link di bawah untuk Reset Password Anda</p> <p>${process.env.CLIENT_URL}/admin/reset-password/${token}</p>`,
        };
        kirimEmail(templateEmail);

        req.flash("alertMessage", "silahkan cek email anda!!");
        req.flash("alertStatus", "success");
        res.redirect("/admin/forgot-password");
      }
    } catch (error) {
      req.flash("alertMessage", `${error}`);
      req.flash("alertStatus", "danger");
      res.redirect("/admin/forgot-password");
    }
  },

  // Reset Password
  viewResetPassword: (req, res) => {
    const alertMessage = req.flash("alertMessage");
    const alertStatus = req.flash("alertStatus");
    const alert = {
      message: alertMessage,
      status: alertStatus,
    };
    res.render("admin/forgot/view_resetPass", {
      title: "Arsip | Reset Password",
      alert,
    });
  },

  actionResetPassword: async (req, res) => {
    const { email, password } = req.body;

    try {
      const admin = await Admin.findOne({ email: email });
      if (admin) {
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);
        admin.password = hashPassword;
        await admin.save();
        req.flash("alertMessage", "berhasil mengubah password!!");
        req.flash("alertStatus", "success");
        res.redirect("/admin/reset-password/:token");
      } else {
        req.flash("alertMessage", "email tidak di temukan!!");
        req.flash("alertStatus", "danger");
        res.redirect("/admin/reset-password/:token");
      }
    } catch (error) {
      req.flash("alertMessage", `${error}`);
      req.flash("alertStatus", "danger");
      console.log(error);
      res.redirect("/admin/reset-password/:token");
    }
  },

  // Logout
  logout: async (req, res) => {
    res.cookie("jwt", "", { maxAge: 1 });
    res.redirect("/admin/login");
  },
};
