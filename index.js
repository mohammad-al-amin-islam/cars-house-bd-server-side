const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

//cors
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Cars House BD Server Running Succesfully');

});

app.listen(port, () => {
    console.log('Cars House BD is running on the port', port);
})