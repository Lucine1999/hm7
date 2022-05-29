import express from "express";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.set("json spaces", 2);

function removeGMT(dateStr) {
    let date = dateStr.split(" GMT");
    date.splice(-1);
    return date[0];
}

function getCurrentDate() {
    let toISO = new Date().toISOString();
    let date = new Date(toISO);
    date = removeGMT(date.toString());

    return date;
}

function intervalFunc() {
    fs.readFile("./todo.json", "utf-8", (err, data) => {
        if (err) {
            console.log(err.message);
        }
        if (data !== "") {
            let dateData = JSON.parse(data);
            let alarmSet = false;
            dateData.forEach((elem) => {
                let date = getCurrentDate();
                const savedDate = new Date(elem.date);
                const currentDate = new Date(date);

                if (currentDate < savedDate) {
                    const milliseconds = savedDate - currentDate;
                    const days = Math.floor(milliseconds / 86400000);
                    const hours = Math.floor(
                        (milliseconds % 86400000) / 3600000
                    );
                    const minutes = Math.floor(
                        ((milliseconds % 86400000) % 3600000) / 60000
                    );
                    if (days === 0 && hours === 0) {
                        if (minutes <= 1) {
                            if (!(elem.alarmDone || elem.todoDone)) {
                                console.log(
                                    "Left 2 minutes for todo " + elem.title
                                );
                                elem.alarmDone = true;
                                alarmSet = true;
                            }
                        }
                    }
                }
            });
            if (alarmSet) {
                fs.writeFile("/todo.json", "", function () {
                    console.log("Clear data");
                });

                fs.writeFile(
                    "./todo.json",
                    JSON.stringify(dateData, null, 2),
                    (err) => {
                        if (err) {
                            console.log("Can't write to a file");
                        }
                        console.log("Written successfully");
                    }
                );
            }
        }
    });
}
setInterval(intervalFunc, 1000);

app.get("/toDos", function (req, res, next) {
    try {
        fs.readFile("./todo.json", "utf-8", (err, data) => {
            if (err) {
                next({ statusCode: 400, message: "Can't read from file" });
            }
            if (data === "") {
                res.json("");
            } else {
                res.json(JSON.parse(data));
            }
        });
    } catch (e) {
        console.log(e.message);
        next({});
    }
});

app.post("/toDo", function (req, res, next) {
    try {
        const uuid = uuidv4();
        fs.readFile("./todo.json", "utf-8", (err, data) => {
            if (err) {
                next({ statusCode: 400, message: "Can't read from file" });
            }
            const result = req.body;
            result.id = uuid;
            result.alarmDone = false;
            result.todoDone = false;
            if (data === "") {
                let json = [];
                json.push(result);
                fs.writeFile(
                    "./todo.json",
                    JSON.stringify(json, null, 2),
                    (err) => {
                        if (err) {
                            next({
                                statusCode: 400,
                                message: "Can't write to file",
                            });
                        }
                        console.log("Written successfully");
                        res.status(201).send(JSON.stringify({ id: uuid }));
                    }
                );
            } else {
                let json = JSON.parse(data);
                json.push(result);
                fs.writeFile(
                    "./todo.json",
                    JSON.stringify(json, null, 2),
                    (err) => {
                        if (err) {
                            next({
                                statusCode: 400,
                                message: "Can't write to file",
                            });
                        }
                        console.log("Written successfully");
                        res.status(201).send(JSON.stringify({ id: uuid }));
                    }
                );
            }
        });
    } catch (e) {
        console.log(e.message);
        next({});
    }
});
app.post("/toDo/:id", function (req, res, next) {
    try {
        fs.readFile("./todo.json", "utf-8", (err, data) => {
            if (err) {
                next({ statusCode: 400, message: "Can't read from file" });
            }
            const result = req.body;
            const id = req.params.id;
            if (data === "") {
                next({ statusCode: 400, message: "No data" });
            } else {
                let json = JSON.parse(data);
                const foundData = json.find((el) => el.id === id);

                if (foundData) {
                    json.forEach((elem) => {
                        if (elem.id === id) {
                            elem.title = result.title;
                            elem.date = result.date;
                            elem.todoDone = result.todoDone;
                            elem.alarmDone = false;
                        }
                    });

                    fs.writeFile("/todo.json", "", function () {
                        console.log("Clear data");
                    });

                    fs.writeFile(
                        "./todo.json",
                        JSON.stringify(json, null, 2),
                        (err) => {
                            if (err) {
                                next({
                                    statusCode: 400,
                                    message: "Can't write to file",
                                });
                            }
                            console.log("Written successfully");
                            res.status(201).send({ message: "edited" });
                        }
                    );
                } else {
                    next({
                        statusCode: 400,
                        message: "Can't find data with provided id",
                    });
                }
            }
        });
    } catch (e) {
        console.log(e.message);
        next({});
    }
});

app.delete("/toDo/:id", function (req, res, next) {
    try {
        fs.readFile("./todo.json", "utf-8", (err, data) => {
            if (err) {
                next({ statusCode: 400, message: "Can't read from file" });
            }
            const id = req.params.id;
            if (data === "") {
                next({ statusCode: 400, message: "No data" });
            } else {
                let json = JSON.parse(data);
                const foundData = json.findIndex((el) => el.id === id);

                if (foundData === -1) {
                    next({
                        statusCode: 400,
                        message: "Can't find data with provided id",
                    });
                }

                json.splice(foundData, 1);

                fs.writeFile("/todo.json", "", function () {
                    console.log("Clear data");
                });

                fs.writeFile(
                    "./todo.json",
                    JSON.stringify(json, null, 2),
                    (err) => {
                        if (err) {
                            next({
                                statusCode: 400,
                                message: "Can't write to file",
                            });
                        }
                        console.log("Written successfully");
                        res.status(201).send({ message: "deleted" });
                    }
                );
            }
        });
    } catch (e) {
        console.log(e.message);
        next({});
    }
});

app.use((err, req, res, next) => {
    console.log(err.statusCode);
    const status = err.statusCode || 500;

    res.status(status).json({
        message: status === 500 ? "Something went wrong" : err.message,
    });
});

app.listen(5008, function () {
    console.log("start");
});
