const express = require("express");
const cors = require("cors");
const jwt = require ("jsonwebtoken");
const port = process.env.PORT || 5000;

const app = express();

app.use(cors())
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://doctorsPortal:bqGebcgYPKOErADG@projects-database.nhjiajb.mongodb.net/?retryWrites=true&w=majority";
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try{
        const appointmentOptionCollections = client.db("doctorsPortal").collection("appointmentOptions");
        const bookingsCollection = client.db("doctorsPortal").collection("bookings");
        const usersCollection = client.db("doctorsPortal").collection("users");

        app.get("/appointmentOptions", async(req, res) => {
            const query = {};
            const options = await appointmentOptionCollections.find(query).toArray();
            res.send(options);
        });

        app.get("/bookings", async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })

        app.post("/bookings", async(req, res) => {
            const booking = req.body;
            console.log(booking)
            const query = {
                appointmentDate: booking.appointmentDate,
                email: booking.email,
                treatment: booking.treatment
            }

            const alreadyBooked = await bookingsCollection.find(query).toArray();
            if(alreadyBooked.length){
                const message = `You already booked an appointment on ${booking.appointmentDate}`
                return res.send({
                    acknowledged: false,
                    message
                })
            }

            const result = await bookingsCollection.insertOne(booking);
            res.send(result)
        })

        
        app.get("/token", async(req, res) => {
            const email = req.query.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            console.log(user);
            res.send({
                accessToken: "Token"
            })
        })

        app.post("/user", async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })
    }
    finally{

    }
}
run().catch(console.dir)


app.get("/", async (req, res) => {
    res.send("Doctors portal is running")
})

app.listen(port, () => {
    console.log("Server is running succesfully", port);
})