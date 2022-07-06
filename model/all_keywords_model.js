//creating a model in atlas in mongoDB with the name of keyword_values for all_keyword document

const mongoose = require('mongoose');
//schemas
const problemSchema = new mongoose.Schema({
  keyword_values: String,

}, { timestamp: true });

const keyword = mongoose.model('keyword', problemSchema);

module.exports = keyword;


