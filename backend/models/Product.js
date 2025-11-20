const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shortDescription: { type: String, required: true },
  fullDescription: { type: String },
  price: { type: Number, required: true },
  image: { type: String } // URL from uploads
});

module.exports = mongoose.model('Product', productSchema);