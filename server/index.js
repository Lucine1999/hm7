import express from "express";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.set("json spaces", 2);

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
                            res.status(201).send({ id: foundData.id });
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

app.use((err, req, res, next) => {
    console.log(err.statusCode);
    const status = err.statusCode || 500;

    res.status(status).json({
        message: status === 500 ? "Something went wrong" : err.message,
    });
});

app.listen(5003, function () {
    console.log("start");
});
