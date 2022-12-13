const router = require("express").Router();
const admin = require("../controller/adminController");
const { uploadSingle } = require("../middleware/multer");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/login", admin.viewLogin);
router.post("/login", admin.actionLogin);
router.get("/register", requireAuth, admin.viewRegister);
router.post("/register", admin.actionRegister);
router.get("/dashboard", requireAuth, admin.viewDashboard);
router.get("/data", admin.dataDashboard);
// Postingan
router.get("/post", requireAuth, admin.viewPost);
router.post("/post", uploadSingle, admin.addPost);
router.get("/post/:id", requireAuth, admin.viewEditPost);
router.put("/post", uploadSingle, admin.editPost);
router.get("/detailPost/:id", requireAuth, admin.viewDetailPost);
router.delete("/post/:id", admin.deletePost);
// visi misi
router.get("/visi-misi", requireAuth, admin.viewVisiMisi);
router.post("/visi-misi", admin.addVisiMisi);
router.get("/visi-misi/:id", requireAuth, admin.viewEditVisiMisi);
router.put("/visi-misi", admin.editVisiMisi);
router.delete("/visi-misi/:id", admin.deleteVisiMisi);
// Coming Soon
router.get("/coming-soon", requireAuth, admin.comingSoonView);
router.post("/coming-soon", uploadSingle, admin.addComingSoon);
router.get("/coming-soon/:id", requireAuth, admin.viewEditComingSoon);
router.put("/coming-soon", uploadSingle, admin.editComingSoon);
router.delete("/coming-soon/:id", admin.deleteComingSoon);
//Divisi
router.get("/divisi", requireAuth, admin.viewDivisi);
router.post("/divisi", uploadSingle, admin.addDivisi);
router.get("/divisi/:id", requireAuth, admin.viewEditDivisi);
router.put("/divisi", uploadSingle, admin.editDivisi);
router.delete("/divisi/:id", admin.deleteDivisi);
// Proker
router.get("/proker", requireAuth, admin.viewProker);
router.post("/proker", admin.addProker);
router.get("/proker/:id", requireAuth, admin.viewEditProker);
router.put("/proker", admin.editProker);
router.delete("/proker/:id", admin.deleteProker);
// Forgot Password
router.get("/forgot-password", admin.forgotPassView);
router.post("/forgot-password", admin.actionForgotPass);
// Reset Password
router.get("/reset-password/:token", admin.viewResetPassword);
router.post("/reset-password", admin.actionResetPassword);
// logout
router.get("/logout", admin.logout);

module.exports = router;
