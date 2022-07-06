const express = require('express');   // express is a node.js application framework
let ejs = require('ejs');
const fs = require('fs');
var StopwordsFilter = require('node-stopwords-filter');  //removes stopwords
const { exit } = require('process');
const { bre } = require('stopword');
var f = new StopwordsFilter();
const { removeStopwords } = require('stopword');
var bodyParser = require('body-parser');      //It Parses incoming request bodies in a middleware before your handlers, available under the req.body property.

const mongoose = require('mongoose');
const URI = "mongodb+srv://sajjad:sajjad@cluster0.y6bfs.mongodb.net/problem2?retryWrites=true&w=majority"

const all_problem = require('./model/problem_model');   //making an instance of a problem_model
const keyword = require('./model/all_keywords_model');
const itf_doc = require('./model/itf_values_model');
const tf_idf = require('./model/tf_idf_values_model');
const mag_v = require('./model/mag_doc_model');


mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("connected to db"))
    .catch((err) => console.log("problen in connecting: " + err));


const app = express();    //creating an express app
var PORT = process.env.PORT || 3000;
app.listen(PORT); //listen the connections on the specified host and port
app.use(bodyParser.urlencoded({ extended: false }))  //used to set up middleware for your application
app.use(express.static('public')); //To serve static files such as images, CSS files, and JavaScript files, use the express.static built-in middleware function in Express

app.use(bodyParser.json())
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('homepage');
})


//particular problem route
// app.get('/problems/:id', (req, res) => {
//     var id1 = req.params.id;
//     all_problem.find({ problem_id: id1 }, (err, doc) => {
//         if (!err) {
//             res.render('particular_problem', { body: doc });
//         } else {
//             console.log(err);
//         }
//     })
// })


//imorting all_keywords from mongoDB
var all_keyws = [];
keyword.find((err, doc) => {
    if (!err) {

        all_keyws = doc[0]['keyword_values'].split(',');
    } else {
        console.log("got some erro");
    }
})
// console.log(all_keyws);


var mag_docs = [];
mag_v.find((err, doc) => {
    if (!err) {
        mag_docs = doc[0]['mag_values'].split(',');
    } else {
        console.log("got some erro");
    }
})



var itf_values = [];

itf_doc.find((err, doc) => {
    if (!err) {
        itf_values = doc[0]['itf_values'].split(',');
    } else {
        console.log("got some erro");
    }
})

var tf_idf_matrix = [];  //tf*idf values
tf_idf.find((err, doc) => {
    if (!err) {
        tf_idf_matrix = doc[0]['tf_idf_values'].split(',');
    } else {
        console.log("got some erro");
    }
})

app.post('/home', (req, res) => { //when something is typed in search box, it get posted and obtained from req.body.name
    console.log(req.body.name);
    var query = req.body.name;
    var string = query.toLowerCase();

    var x = 952;
    string = string.replace(/(\r\n|\n|\r)/gm, "");
    string = string.split(' ');
    string = string;
    var carr = removeStopwords(string);
    carr.sort();

    var mp_query = new Map();

    carr.forEach(element => {
        if (mp_query.has(element)) {
            mp_query.set(element, mp_query.get(element) + 1);
        } else {
            mp_query.set(element, 1);
        }
    });

    var sz_query_keywords = carr.length;
    var tf_query = [];
    var cnt = 0;
    all_keyws.forEach(element => { //calculating tf values for query
        cnt += 1;
        if (mp_query.has(element)) {
            tf_query.push(mp_query.get(element) / sz_query_keywords);
        } else {
            tf_query.push(0);
        }
    });

    var tf_itf_query = [];
    for (var i = 0; i < itf_values.length; i++) {  //calculating tf*idf values for query
        tf_itf_query.push(tf_query[i] * itf_values[i]);
    }

    var tf_value_doc = [];  //making 1D tf_idf_matrix into 2D
    for (var i = 0; i < x; i++) {
        var values = [];
        for (var j = 0; j < tf_idf_matrix.length / x; j++) {  //tf_idf_matrix.length will give the area of thematrix
            values.push(tf_idf_matrix[(tf_idf_matrix.length / x) * i + j]);
        }
        tf_value_doc.push(values);
    }

    var cbt_zero = 0;
    var mag_query = 0;
    for (var i = 0; i < itf_values.length; i++) { //calculating magnitude of query
        if (tf_itf_query[i] > 0) {
            cbt_zero++;
            mag_query += tf_itf_query[i] * tf_itf_query[i];
        }
    }
    mag_query = Math.sqrt(mag_query);

    var mp_cosine_values = new Map();   //stores cosine values of (query with each document) and id of each document
    for (var i = 0; i < tf_value_doc.length; i++) {
        var val = 0;  //val gives dot product of each doc and query Vq.Di
        for (var j = 0; j < tf_value_doc[0].length; j++) {

            if (!isNaN(tf_itf_query[j])) {
                val += tf_value_doc[i][j] * tf_itf_query[j];
            }
        }
        val = val / mag_docs[i];   //mag_docs[i] is magnitude of each docs
        val = val / mag_query;     //mag_query is magnitude of query
        mp_cosine_values.set(val, i + 1);
    }

    var mapAsc = new Map([...mp_cosine_values.entries()].sort().reverse()); //sort in descending of cosine values and put in mapAsc

    // var cnt = 0;
    // var arr_q = [];
    // var arr_titles = [];
    // var arr_pr_desc = [];
    var query_keys = [];  //store problem id in descending order

    //store the key(cosine value) from map to query_keys.
    mapAsc.forEach((key, value) => {
        query_keys.push(key);
        // console.log(key);
    })
    // console.log(query_keys.length);


    async function dbData() { //database se top 15 question mangaa rha h 
        try {
            var data = [];
            for (var i = 0; i < Math.min(15, query_keys.length); i++) {
                // console.log(query_keys[i]);
                let dbData = await all_problem.find({ problem_id: query_keys[i] });   // 15 problems yhi se aa rha h
                // console.log(dbData);
                // console.log(all_problem.find({problem_id: query_keys[i]}))
                if (typeof dbData[0] !== 'undefined') {
                    data.push(dbData[0]);
                }

            }
            return data;
        }
        catch (err) {
            console.log(err)
        }
    }
    (async function () { //callback
        const doc = await dbData()  //data of 15 questions
        console.log(doc);

        res.render('homepage_questions', { body: doc });  //homepage_question me data bhej raha h body ke through

    })();

})

app.get('/home', (req, res) => {
    all_problem.find().limit(15).exec((err, doc) => {
        if (!err) {
            res.render('homepage_questions', { body: doc });
        } else {
            console.log(err);
        }
    })
});
