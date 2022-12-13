const mongoose = require("mongoose");

const visiMisiSchema = new mongoose.Schema({
  visi: {
    type: String,
    required: true,
  },
  misi: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("visiMisi", visiMisiSchema);
