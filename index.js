import { BASE_URL } from "./constants.js";

function removeGMT(dateStr) {
    let date = dateStr.split(" GMT");
    date.splice(-1);
    return date[0];
}

const toDoList = document.getElementById("to-do-list");

fetch(`${BASE_URL}toDos`)
    .then((response) => response.json())
    .then((data) => {
        if (data === "") {
            return;
        }

        data.forEach((element) => {
            let toDoItem = document.getElementById("to-do-template");
            let toDoItemClone = toDoItem.content.cloneNode(true);

            toDoItemClone.querySelector(".card-title").innerText =
                element.title;
            if (element.date) {
                toDoItemClone.querySelector(".card-text").innerText =
                    element.date;
            }

            toDoItemClone
                .querySelector(".btn-edit")
                .setAttribute("data-id", element.id);
            toDoItemClone
                .querySelector(".btn-delete")
                .setAttribute("data-id", element.id);

            toDoList.append(toDoItemClone);
        });

        const editBtns = document.querySelectorAll(".btn-edit");

        editBtns.forEach((elem) => {
            elem.addEventListener("click", function () {
                let dataId = elem.getAttribute("data-id");

                let editData = data.find((elem) => elem.id === dataId);

                const editToDo = document.getElementById("edit-todo");
                editToDo.querySelector(".todo-id").value = editData.id;

                editToDo.querySelector("#title").value = editData.title;
                if (editData.date) {
                    editToDo.querySelector("#dateEdit").value = editData.date;
                }

                $("#edit-todo").modal("show");
            });
        });
    });

document
    .getElementById("add-todo-button")
    .addEventListener("click", function (e) {
        e.preventDefault();

        const title = document.querySelector("#title").value;
        if (!document.querySelector("#date").value) {
            alert("Fill the date");
            return;
        }
        let toISO = new Date(
            document.querySelector("#date").value
        ).toISOString();
        let date = new Date(toISO);
        date = removeGMT(date.toString());
        let currentDate = new Date();
        currentDate = removeGMT(currentDate.toString());

        const data = {
            title,
            date,
            currentDate,
        };

        fetch(`${BASE_URL}toDo`, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            mode: "cors",
            body: JSON.stringify(data),
        })
            .then((r) => r.json())
            .then((e) => console.log(e));
    });

document
    .getElementById("edit-todo-form")
    .addEventListener("submit", function (e) {
        e.preventDefault();

        const title = this.querySelector("#title").value;
        let date;

        if (!this.querySelector("#date").value) {
            date = this.querySelector("#dateEdit").value;
        } else {
            console.log("aaa");
            let toISO = new Date(
                this.querySelector("#date").value
            ).toISOString();
            date = new Date(toISO);
            date = removeGMT(date.toString());
        }

        let currentDate = new Date();
        let id = this.querySelector(".todo-id").value;
        currentDate = removeGMT(currentDate.toString());

        const data = {
            title,
            date,
            currentDate,
        };

        fetch(`${BASE_URL}toDo/${id}`, {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            mode: "cors",
            body: JSON.stringify(data),
        })
            .then((r) => r.json())
            .then((e) => console.log(e));
    });
