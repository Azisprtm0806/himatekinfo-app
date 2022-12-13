const mongoose = require("mongoose");

delete mongoose.connection.models["proker"];

const prokersSchema = new mongoose.Schema({
  namaProker: {
    type: String,
    required: true,
  },
  deskripsi: {
    type: String,
    required: true,
  },
});

// export default mongoose.model("Proker", prokerSchema);

module.exports = mongoose.model("Prokers", prokersSchema);
