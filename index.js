const express = require('express')
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sssz8.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()
app.use(cors());
app.use(bodyParser.json());

const port = 5000


client.connect(err => {
  const productCollection = client.db(process.env.DB_NAME).collection(process.env.DB_COLLECTION);
  const orderCollection = client.db(process.env.DB_NAME).collection(process.env.DB_ORDERS);
  
  console.log('connected to database')
  app.post('/addProduct', (req, res) => {
    const products = req.body;
    productCollection.insertMany(products)
    .then(result => {
      res.send(result.insertedCount);
    })
  })

  app.get('/products', (req, res) => {
    productCollection.find({}).limit(20)
    .toArray((err, documents) => {
      res.send(documents);
    })
  })
  app.get('/product/:key', (req, res) => {
    productCollection.find({key: req.params.key})
    .toArray((documents) => {
      res.send(documents[0]);
    })
  })

  app.post('/productsByKeys', (req, res) => {
    const productKeys = req.body;
    productCollection.find({key: { $in: productKeys}})
    .toArray((err, documents) => {
      res.send(documents);
    })
  })

  app.post('/addOrder', (req, res) => {
    const order = req.body;
    orderCollection.insertOne(order)
    .then(result => {
      res.send(result.insertedCount > 0);
    })
  })
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})