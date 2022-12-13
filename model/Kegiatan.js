const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const kegiatanSchema = new mongoose.Schema({
  namaProker: {
    type: String,
    required: true,
  },
  deskripsi: {
    type: String,
    required: true,
  },
  imageId: [
    {
      type: ObjectId,
      ref: "Image",
    },
  ],
  divisiId: [
    {
      type: ObjectId,
      ref: "Divisi",
    },
  ],
});

module.exports = mongoose.model("Kegiatan", kegiatanSchema);
