const mongoose = require('mongoose');     //mongoose ke through atlas me data ko connect karte h
const URI = "mongodb+srv://sajjad:sajjad@cluster0.y6bfs.mongodb.net/problem2?retryWrites=true&w=majority"  //take username and password form mongoDB

//taking the schemas which is created in the model
const all_problem = require('./model/problem_model');
const keyword = require('./model/all_keywords_model');
const itf_doc = require('./model/itf_values_model');
const tf_idf = require('./model/tf_idf_values_model');
const mag_v = require('./model/mag_doc_model');

// const app = express();
const fs = require('fs');

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("connected to db"))
    .catch((err) => console.log("problen in connecting: " + err));


// //model 1-> for all_keywords
var all_keyws = fs.readFileSync('all_keywords_titles.txt').toString();  //read all_keywords
// // console.log(all_keyws);

// //keyword model jisko save karna h
// const key = new keyword({
//     keyword_values: all_keyws
// })

// // saving the keyword to mongoDB atlas
// key.save().then(result => {
//     console.log('Keywords saved!')
// }).catch((err) => {
//     console.log(err);
// })



//model 2-> for tf_idf_value
// var tf_idf_v = fs.readFileSync('tf_idf_values.txt').toString();
// // console.log(tf_idf_v);

// const key = new tf_idf({
//     tf_idf_values: tf_idf_v
// })

// key.save().then(result => {
//     console.log('TF-IDF values saved!')
// }).catch((err) => {
//     console.log(err);
// })


//model 3-> for idf_values
// var itf_v = fs.readFileSync('idf_value_titles.txt').toString();
// // console.log(itf_v);

// const key = new itf_doc({
//     itf_values: itf_v
// })

// key.save().then(result => {
//     console.log('IDF values saved!')
// }).catch((err) => {
//     console.log(err);
// })



//saving problems and magnitude values,  model 4-> for problem_model
var problem_desc = [];
var problem_title = [];
var problem_url = [];

for (var i = 1; i <= 952; i++) {
    var str = fs.readFileSync('problem_text/problem' + i.toString() + '.txt').toString();
    // str = str.toLowerCase();
    problem_desc.push(str);
}

problem_title = fs.readFileSync('problem_titles.txt').toString().split('\n');
problem_url = fs.readFileSync('problem_urls.txt').toString().split('\n');


var tf_idf_matrix = fs.readFileSync('tf_idf_values.txt').toString().split(',');

var x = 952;

var sz = all_keyws.length;
var mag_docs = [];

for (var i = 0; i < 952; i++) {
    var value = 0;
    for (var j = 0; j < sz; j++) {
        if (!isNaN(tf_idf_matrix[i * sz + j])) {
            value += tf_idf_matrix[i * sz + j] * tf_idf_matrix[i * sz + j];
        }
    }

    mag_docs.push(Math.sqrt(value));

    const all_prob = new all_problem({  //each problem model jisko save karna h
        problem_desc: problem_desc[i],
        problem_title: problem_title[i],
        problem_url: problem_url[i],
        problem_mag: Math.sqrt(value),
        problem_id: i + 1
    });

    all_prob.save().then(result => {
        console.log('problem saved!')
    }).catch((err) => {
        console.log(err);
    });

}

console.log(mag_docs)


//model 5-> for mag_doc_model
var to_save = mag_docs.toString();

const mag_save = new mag_v({
    mag_values: to_save,
});

mag_save.save().then(result => {
    console.log('mags saved!')
}).catch((err) => {
    console.log(err);
});