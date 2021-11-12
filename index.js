const express =  require('express');
const cors = require("cors");

require("dotenv").config();
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId


const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ptx5l.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
    try{
        await client.connect();
        const servicesCollection = client.db('tourism-agency').collection('services')
        const ordersCollections = client.db('tourism-agency').collection('orders')

        //Get All TourPackages Api
        app.get('/services', async(req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();

            res.send(services);
        })

        //Get All Orders Api
        app.get('/allOrders', async(req, res) => {
            const cursor = ordersCollections.find({});
            const orders = await cursor.toArray();
            res.send(orders)
        })

        //Get Single Destination
        app.get('/destination/:id', async(req, res) => {
            const id = req.params.id;;
            const query = {_id: ObjectId(id)};
            const destination = await servicesCollection.findOne(query);
            res.send(destination);
        })

        //Add Order
        app.post("/addOrder", async(req, res) => {
            const order = req.body;
            const result = await ordersCollections.insertOne(order)
            res.json(result)
        })

        //Get My Order
        app.get("/myOrders/:email", async (req, res) => {
            console.log(req.params.email)
            const result = await ordersCollections.find({email: req.params.email}).toArray();
            res.json(result)
            // console.log(result)
        })

        //Delete Order
        app.delete('/deleteOrder/:orderId', async(req, res) => {
            const id = req.params.orderId;
            const result = await ordersCollections.deleteOne({_id: id});
            res.json(result);

        })
        
        //Update Order
        app.put("/updateOrder/:id", async (req, res) => {
            const id = req.params.id;
            console.log('updating order', id)
            const filter = { _id: id};
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                  status:"Done"
                },
              };
            const result = await ordersCollections.updateOne(filter, updateDoc);
            res.json(result);
        })


        //Post Api 
        app.post('/addService', async (req, res) => {
            const destination = req.body;
            const result = await servicesCollection.insertOne(destination);
            res.send(result)
        })

        
    }
    finally{
        // await client.close()
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running Tourism agency..')
})


app.listen(port, () => {
    console.log('running tourism agency on port', port)
})