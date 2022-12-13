const jwt = require("jsonwebtoken");
const Admin = require("../model/Admin");

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // check json web token exists & is verivied
  if (token) {
    jwt.verify(token, "secret", (err, decodedToken) => {
      if (err) {
        res.redirect("/admin/login");
      } else {
        next();
      }
    });
  } else {
    res.redirect("/admin/login");
  }
};

// check current user
const checkAdmin = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, "secret", async (err, decodedToken) => {
      if (err) {
        res.locals.admin = null;
        next();
      } else {
        let admin = await Admin.findById(decodedToken.id);
        res.locals.admin = admin;
        next();
      }
    });
  } else {
    res.locals.admin = null;
    next();
  }
};

module.exports = { requireAuth, checkAdmin };
