require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion } = require('mongodb');

//middleware
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tk04nnw.mongodb.net/?appName=Cluster0&retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
    res.send('Travel ease server is running')
})

async function run (){
    try{
        await client.connect();

        const db = client.db("travel-ease");
        const carCollection = db.collection("cars");

     
        app.get('/cars', async(req, res) => {
            const cursor = carCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

      
        app.post('/cars', async(req, res) => {
            const vehicle = req.body;
            console.log("Data received:", vehicle); 
            const result = await carCollection.insertOne(vehicle);
            res.send(result);
        })
        
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    }
    finally {
        
    }
}

run().catch(console.dir);

app.listen(port, ()=> {
    console.log(`Travel ease server is running on port: ${port}`)
})