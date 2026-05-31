const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = 3000;

// Access Keys
const ACCESS_KEYS = [
    "RETRAC-ALPHA",
    "RETRAC-BETA",
    "RETRAC-PREMIUM"
];

app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: "retrac-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24
        }
    })
);

app.use("/css", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    if (req.session.loggedIn) {
        return res.redirect("/dashboard");
    }

    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/login", (req, res) => {
    const { key } = req.body;

    if (ACCESS_KEYS.includes(key)) {
        req.session.loggedIn = true;
        req.session.key = key;

        return res.redirect("/dashboard");
    }

    res.send(`
        <h1 style="font-family:Arial">
            Invalid Access Key
        </h1>
        <a href="/">Go Back</a>
    `);
});

app.get("/dashboard", (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect("/");
    }

    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/download/:file", (req, res) => {
    if (!req.session.loggedIn) {
        return res.status(403).send("Access Denied");
    }

    const file = path.join(
        __dirname,
        "downloads",
        req.params.file
    );

    res.download(file);
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

app.listen(PORT, () => {
    console.log(`Retrac running on port ${PORT}`);
});