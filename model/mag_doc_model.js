//creating a schemas in atlas in mongoDB with the name of mag_values for magnitude document(which is created in server_query.js)

const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  mag_values: String,

}, { timestamp: true });

const mag_v = mongoose.model('mag_v', problemSchema);

module.exports = mag_v;

