const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const dokumentasiSchema = new mongoose.Schema({
  deskripsi: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  kegiatanId: [
    {
      type: ObjectId,
      ref: "Kegiatan",
    },
  ],
});

module.exports = mongoose.model("Dokumentasi", dokumentasiSchema);
