const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middle ware
app.use(cors());
app.use(express.json());

//verifying Token
function verifyToken(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) {
        return res.status(401).send({ message: 'Unauthorized' })
    }
    const token = auth.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
            return res.status(403).send({ message: 'Forbidden' });
        }
        req.decoded = decoded;
        next();
    })

}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xft2s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const inventoriesCollection = client.db("carsHouse").collection("inventories");

        //loading all data from db inventories
        app.get('/inventories', async (req, res) => {
            const query = {};
            const cursor = inventoriesCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        //loading a single data
        app.get('/inventories/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await inventoriesCollection.findOne(query);
            res.send(result);
        });


        //updating quantity 
        app.put('/inventories/:id', async (req, res) => {
            const id = req.params.id;
            const count = req.body.quantity;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: count,
                },
            };

            const result = await inventoriesCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        //for deleting a document
        app.delete('/inventory-delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoriesCollection.deleteOne(query);
            res.send(result);
        });

        //inserting data to db
        app.post('/inventories', async (req, res) => {
            const data = req.body;
            const result = await inventoriesCollection.insertOne(data);
            res.send(result);
        });

        //loading userData
        app.get('/myinventories', verifyToken, async (req, res) => {
            const getEmail = req.decoded.email;
            const email = req.query.email;
            if (getEmail === email) {
                const query = { email: email }
                const cursor = inventoriesCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            }
            else {
                res.status(403).send({ message: 'Forbidden' });
            }

        });

        //jwt token creating 
        app.post('/jwtlogin', async (req, res) => {
            const userInfo = req.body;
            const token = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "1d"
            });
            res.send({ token });
        })


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