const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middle ware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xft2s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const invenoriesCollection = client.db("carsHouse").collection("inventories");

        //loading all data from db inventories
        app.get('/inventories', async (req, res) => {
            const query = {};
            const cursor = invenoriesCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
    }
    finally {
        // await client.close();        
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Cars House BD Server Running Succesfully');

});

app.listen(port, () => {
    console.log('Cars House BD is running on the port', port);
})