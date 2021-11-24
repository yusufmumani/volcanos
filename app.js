const express = require("express"); // Import the express dependency
const indexRouter = require('./routes/index');

const app = express(); // Instantiate an express app, the main work horse of this server
const port = 5000; // Save the port number where your server will be listening

// Set the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({extended: false}));
app.use('/', indexRouter);

app.listen(port, () => { // server starts listening for any attempts from a client to connect at port: {port}
    console.log(`Server started (http://localhost:${port}/)`);
});