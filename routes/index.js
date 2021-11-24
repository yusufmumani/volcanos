const express = require("express"); // Import the express dependency
const sqlite3 = require("sqlite3").verbose(); // Import the express dependency
const AhoCorasick = require("../algo/AhoCorasick");

const router = express.Router();
let db = new sqlite3.Database('volcanos.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log("Successful connection to database  'volcanos.db'");
});

/** The Website **/

// Idiomatic expression in express to route and respond to a client request
router.get('/', function (req, res) { // get requests to the root ("/") will route here
    res.render('pages/index.ejs', {page: "home"});
});

// GET /volcanos
router.get("/volcanos", (req, res) => {
    const sql = "SELECT * FROM volcanos ORDER BY Name";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        res.render("pages/volcanos", {page: "volcanos", model: rows});
    });
});

// GET /create
router.get("/create", (req, res) => {
    res.render("pages/create", {model: {}});
});

// GET /volcano/5
router.get("/volcano/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM volcanos WHERE ID = ?";
    db.get(sql, id, (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        if (row == undefined) res.redirect("/volcanos");
        res.render("pages/volcano", {model: row});
    });
});

// GET /edit/5
router.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM volcanos WHERE ID = ?";
    db.get(sql, id, (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        if (row == undefined) res.redirect("/volcanos");
        res.render("pages/edit", {model: row});
    });
});

// GET /delete/5
router.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM volcanos WHERE ID = ?";
    db.get(sql, id, (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        if (row == undefined) res.redirect("/volcanos");
        res.render("pages/delete", {model: row});
    });
});

/** API **/

// Search API
router.post("/api/search", express.json({type: '*/*'}), (req, res) => {
    let query = req.body.searchQuery.trim("\\s+");
    const sql = "SELECT * FROM volcanos ORDER BY Name";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }

        if (query === "") {
            res.json(rows);
            return;
        }

        const ahocorasick = new AhoCorasick(query);
        let filter = [];
        rows.forEach(function (volcano, index) {
            let results = ahocorasick.search(volcano.Name);
            if (results.length) {
                volcano.SearchResults = results;
                filter.push(volcano);
            }
        });
        res.json(filter);
    });
});

// Retrieve all volcanos in JSON format
router.get("/api/volcanos", (req, res) => {
    const sql = "SELECT * FROM volcanos ORDER BY Name";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        res.json(rows);
    });
});

// Retrieve the information about a specific volcano
router.get("/api/volcano/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM volcanos WHERE ID = ?";
    db.get(sql, id, (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        res.json(row);
    });
});

// Create a new volcano
router.post("/api/volcano", express.text({type: '*/*'}), (req, res) => {
    const sql = "INSERT INTO volcanos (Name, Location, History, Active) VALUES (?, ?, ?, ?)";
    let volcano;
    try {
        req.body = JSON.parse(req.body);
        volcano = [req.body.Name, req.body.Location, req.body.History, req.body.Active];
    } catch (err) {
        return res.json({"status": "error", "msg": err.message});
    }
    db.run(sql, volcano, err => {
        if (err) {
            res.json({"status": "error", "msg": err.message});
        }
        return res.json({"status": "success"});
    });
});

// Update the details of a volcano
router.put('/api/volcano/:id', express.text({type: '*/*'}), function (req, res) {
    const id = req.params.id;

    let volcano;
    try {
        req.body = JSON.parse(req.body);
        volcano = [req.body.Name, req.body.Location, req.body.History, req.body.Active, id];
    } catch (err) {
        return res.json({"status": "error", "msg": err.message});
    }

    const sql = "UPDATE volcanos SET Name = ?, Location = ?, History = ?, Active = ? WHERE (ID = ?)";
    db.run(sql, volcano, err => {
        if (err) {
            res.json({"status": "error", "msg": err.message});
        }
        return res.json({
            "Name": req.body.Name,
            "Location": req.body.Location,
            "History": req.body.History,
            "Active": req.body.Active
        });
    });
});

// Remove a volcano by its ID
router.delete('/api/volcano/:id', express.text({type: '*/*'}), function (req, res) {
    const id = req.params.id;
    const sql = "DELETE FROM volcanos WHERE ID = ?";

    db.run(sql, id, err => {
        if (err) {
            return console.error(err.message);
        }
        return res.json({"status": "success"});
    });
});

module.exports = router;