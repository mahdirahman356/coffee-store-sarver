const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rz0kihv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const database = client.db("coffeestDB");
    const coffeesCollection = database.collection("coffees");

    app.get("/coffees", async(req, res) => {
      const cursor = coffeesCollection.find();
      const  result = await cursor.toArray()
      res.send(result)
      console.log(result)
    })
    
    app.get("/coffees/:id", async(req, res) => {
        const id = req.params.id
        const query = {_id: new ObjectId(id)};
        const result = await coffeesCollection.findOne(query);
        res.send(result)
    })

    app.post("/coffees", async(req, res) => {
        const coffee = req.body
        const result = await coffeesCollection.insertOne(coffee);
        res.send(result)

    })

    app.put("/coffees/:id", async(req, res) => {
        const id = req.params.id
        const coffee = req.body
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updateCoffee = {
          $set: {
            name: coffee.name, 
            chef: coffee.chef, 
            supplier: coffee.supplier, 
            test: coffee.test, 
            category: coffee.category, 
            details: coffee.details, 
            photo: coffee.photo,
          },
        };
        const result = await coffeesCollection.updateOne(filter, updateCoffee, options);
        res.send(result)

    })

    app.delete("/coffees/:id", async(req, res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id) };
        const result = await coffeesCollection.deleteOne(query);
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.get("/", (req, res) => {
        res.send('coffee store')
    })
    
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
