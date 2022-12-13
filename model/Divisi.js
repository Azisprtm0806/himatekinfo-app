const mongoose = require("mongoose");
const divisiSchema = new mongoose.Schema({
  namaDivisi: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  deskripsi: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Divisi", divisiSchema);
