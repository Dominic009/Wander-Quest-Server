const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Create MongoClient without deprecated options
const client = new MongoClient(process.env.MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  monitorCommands: true,
});

// ✅ Function to connect and run server
async function run() {
  try {
    console.log("Connecting to MongoDB...");

    // ✅ Ensure MongoDB connection works
    await client.connect();
    console.log("✅ Connected to MongoDB successfully!");

    const spotCollection = client.db("touristSpotDB").collection("spots");

    // ✅ Create
    app.post("/spot", async (req, res) => {
      try {
        const newSpot = req.body;
        const result = await spotCollection.insertOne(newSpot);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error adding spot", error });
      }
    });

    // ✅ Read all spots
    app.get("/spot", async (req, res) => {
      try {
        const result = await spotCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error retrieving spots", error });
      }
    });

    // ✅ Read specific spot by ID
    app.get("/spot/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await spotCollection.findOne({ _id: new ObjectId(id) });
        if (!result) return res.status(404).send({ message: "Spot not found" });
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error retrieving spot", error });
      }
    });

    // ✅ Delete spot
    app.delete("/spot/delete/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await spotCollection.deleteOne({
          _id: new ObjectId(id),
        });
        if (result.deletedCount === 0) {
          return res.status(404).send({ message: "No spot found to delete" });
        }
        res.send({ message: "Entry has been deleted", result });
      } catch (error) {
        res.status(500).send({ message: "Error deleting spot", error });
      }
    });

    // ✅ Ping MongoDB
    await client.db("touristSpotDB").command({ ping: 1 });
    console.log("✅ Pinged MongoDB successfully!");

    // ✅ Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("Closing MongoDB connection...");
      await client.close();
      console.log("MongoDB connection closed. Server shutting down.");
      process.exit(0);
    });
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
}

run().catch(console.error);

// ✅ Default route
app.get("/", (req, res) => {
  res.send("Server is running for Wander Quest");
});

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port} for Wander Quest`);
});
