const express = require('express');
const { ObjectId } = require('mongodb');
let app = express();
const { connectToDb, getDb } = require('./db')

let db;

app.use(express.json())

connectToDb( (err)=>{
 if(!err){
    app.listen(5000, function(){
        console.log('Listening on port 5000')
    });
    db = getDb();
 }
});


app.get('/api/v1/books', function(req, res){
    //current page
    const page = req.query.p || 0;
    const booksPerPage = 3;


    let books = []
    db.collection('books')
    .find()
    .sort({pages : -1})
    .skip(page * booksPerPage)
    .limit(booksPerPage)
    .forEach(book => {
        books.push(book)
    })
    .then(()=>{
        res.status(200).json(books)
    })
    .catch( ()=>{
        res.status(500).json({error: "Could not fetch Data"})
    })
});

app.get('/api/v1/books/:id', function(req, res){

    if(ObjectId.isValid(req.params.id)){
        db.collection('books')
        .findOne({_id: ObjectId(req.params.id)})
            .then((doc)=>{
                res.status(200).json(doc)
            })
            .catch( ()=>{
                res.status(500).json({error: "Could not fetch Data"})
            })
    }else{
        res.status(500).json({error: 'Not valid id'})
    }
    
});

app.post('/api/v1/books', function(req, res){
    let book = req.body;

    db.collection('books')
    .insertOne(book)
    .then(result => {
        res.status(201).json(result)
    })
    .catch(err =>{
        res.status(500).json({error: 'Could not POST document'})
    })
});

app.delete('/api/v1/books/:id', function(req, res){
    if(ObjectId.isValid(req.params.id)){
        db.collection('books')
        .deleteOne({_id: ObjectId(req.params.id)})
            .then((result)=>{
                res.status(200).json(result)
            })
            .catch( ()=>{
                res.status(500).json({error: "Could not Delete Data"})
            })
    }else{
        res.status(500).json({error: 'Not valid id'})
    }
})

app.patch('/api/v1/books/:id', function(req, res){
    let updates = req.body;

    if(ObjectId.isValid(req.params.id)){
        db.collection('books')
        .updateOne({_id: ObjectId(req.params.id)}, {$set: updates})
            .then((result)=>{
                res.status(200).json(result)
            })
            .catch( ()=>{
                res.status(500).json({error: "Could not Update Data"})
            })
    }else{
        res.status(500).json({error: 'Not valid id'})
    }
});