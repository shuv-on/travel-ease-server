require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors({
    origin: ["http://localhost:5173", "https://travel-ease-client-self.vercel.app"], 
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
const bookingsCollection = db.collection("bookings");

async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB!");
        return true;
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        return false;
    }
}


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
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.get('/cars/:id', async (req, res) => {
    try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }
        const query = { _id: new ObjectId(id) };
        const result = await carCollection.findOne(query);
        if (!result) {
            return res.status(404).json({ error: "Car not found" });
        }
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error while fetching car" });
    }
});


app.post('/cars', async (req, res) => {
    try {
        const vehicle = req.body;
        console.log("Data received:", vehicle);
        const result = await carCollection.insertOne(vehicle);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error inserting data" });
    }
});

app.post('/bookings', async (req, res) => {
    try {
        const booking = req.body;
        console.log("Booking data received:", booking);
        const result = await bookingsCollection.insertOne(booking);
        if (result.insertedId) {
            res.json({ insertedId: result.insertedId, message: 'Booking created successfully' });
        } else {
            res.status(400).json({ error: 'Failed to create booking' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating booking' });
    }
});


app.get('/bookings', async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) {
            return res.status(400).json({ error: 'Email parameter is required' });
        }
        const query = { userEmail: email };
        const result = await bookingsCollection.find(query).sort({ bookingDate: -1 }).toArray();
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching bookings' });
    }
});


async function startServer() {
    const connected = await connectDB();
    if (connected) {
        if (process.env.NODE_ENV !== 'production') {
            app.listen(port, () => {
                console.log(`Server running on port: ${port}`);
            });
        }
        
    } else {
        console.error("Failed to start server due to DB connection issue.");
    }
}

startServer();

module.exports = app;