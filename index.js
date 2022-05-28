import { BASE_URL } from "./constants.js";

function removeGMT(dateStr) {
    let date = dateStr.split(" GMT");
    date.splice(-1);
    return date[0];
}

const toDoList = document.getElementById("to-do-list");

function editBtnsClick(data) {
    const editToDo = document.getElementById("edit-todo");
    editToDo.querySelector(".todo-id").value = data.id;

    editToDo.querySelector("#title").value = data.title;

    editToDo.querySelector(".done-check").removeAttribute("checked");

    if (data.todoDone) {
        editToDo.querySelector(".done-check").setAttribute("checked", true);
    }

    if (data.date) {
        editToDo.querySelector("#dateEdit").value = data.date;
    }

    $("#edit-todo").modal("show");
}

function deleteBtnsClick(id) {
    fetch(`${BASE_URL}toDo/${id}`, {
        headers: {
            "Content-Type": "application/json",
        },
        method: "DELETE",
        mode: "cors",
    })
        .then((r) => r.json())
        .then((e) => console.log(e));
}

function changeToDo(id, data) {
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
}

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

            if (element.todoDone) {
                toDoItemClone
                    .querySelector(".done-check")
                    .setAttribute("checked", true);
            }

            toDoItemClone
                .querySelector(".done-check")
                .addEventListener("change", (e) => {
                    let newElem = { ...element };
                    newElem.todoDone = false;
                    if (e.target.checked) {
                        newElem.todoDone = true;
                    }
                    changeToDo(newElem.id,newElem);
                });

            toDoItemClone
                .querySelector(".btn-delete")
                .addEventListener("click", () => {
                    deleteBtnsClick(element.id);
                });

            toDoItemClone
                .querySelector(".btn-edit")
                .addEventListener("click", () => {
                    editBtnsClick(element);
                });

            toDoList.append(toDoItemClone);
        });
    });

document
    .getElementById("add-todo-form")
    .addEventListener("submit", function (e) {
        e.preventDefault();

        const title = this.querySelector("#title").value;
        if (!this.querySelector("#date").value) {
            alert("Fill the date");
            return;
        }
        let date;
        try {
            date = new Date(this.querySelector("#date").value).toISOString();
            date = new Date(date);
        } catch (e) {
            alert(e.message);
            return;
        }

        let currentDate = new Date().toISOString();
        currentDate = new Date(currentDate);

        if (date < currentDate) {
            alert("Date is not valid");
            return;
        }

        date = removeGMT(date.toString());
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
        let sameDate = false;
        let todoDone = false;

        if (this.querySelector(".done-check").checked) {
            todoDone = true;
        }

        if (!this.querySelector("#date").value) {
            date = this.querySelector("#dateEdit").value;
            sameDate = true;
        } else {
            try {
                date = new Date(
                    this.querySelector("#date").value
                ).toISOString();
                date = new Date(date);
            } catch (e) {
                alert(e.message);
                return;
            }
        }

        let currentDate = new Date().toISOString();
        currentDate = new Date(currentDate);

        if (date < currentDate) {
            alert("Date is not valid");
            return;
        }

        let id = this.querySelector(".todo-id").value;

        currentDate = removeGMT(currentDate.toString());

        if (!sameDate) {
            date = removeGMT(date.toString());
        }

        const data = {
            title,
            date,
            currentDate,
            todoDone,
        };

        changeToDo(id, data);
    });
