//creating a schemas in atlas in mongoDB with the name of itf_idf_values for tf_idf_value document

const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  tf_idf_values: String,

}, { timestamp: true });

const tf_idf = mongoose.model('tf_idf', problemSchema);

module.exports = tf_idf;

