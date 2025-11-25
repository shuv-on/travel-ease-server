require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors({
    origin: ["http://localhost:5173", "https://travel-ease-server-self.vercel.app", "*"], 
    credentials: true
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tk04nnw.mongodb.net/?appName=Cluster0&retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


const db = client.db("travel-ease");
const carCollection = db.collection("cars");


async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB!");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
    }
}
connectDB();


app.get('/', (req, res) => {
    res.send('Travel ease server is running');
});


app.get('/cars', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit);
        let result;
        if (limit) {
            result = await carCollection.find().sort({ _id: -1 }).limit(limit).toArray();
        } else {
            result = await carCollection.find().toArray();
        }
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


app.post('/cars', async (req, res) => {
    try {
        const vehicle = req.body;
        console.log("Data received:", vehicle);
        const result = await carCollection.insertOne(vehicle);
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error inserting data");
    }
});


if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server running on port: ${port}`);
    });
}

module.exports = app;