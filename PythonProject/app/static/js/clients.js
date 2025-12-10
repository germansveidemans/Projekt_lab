const clientsList = document.getElementById("clients-list");
const form = document.getElementById("client-form");
const message = document.getElementById("message");

const clientIdInput = document.getElementById("client-id");
const nameInput = document.getElementById("name_surname");
const emailInput = document.getElementById("email");
const addressInput = document.getElementById("address");
const phoneInput = document.getElementById("phone_number");

const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit");

// Загружаем клиентов при открытии страницы
window.addEventListener("DOMContentLoaded", loadClients);

async function loadClients() {
    const res = await fetch("/clients/");      // <<< РАНЬШЕ тут было /cars/
    const clients = await res.json();

    carsList.innerHTML = "";

    if (clients.length === 0) {
        carsList.innerHTML = "<p>No clients yet.</p>";
        return;
    }

        clients.forEach(client => {
            const div = document.createElement("div");
            div.innerHTML = `
                <p>
                    <strong>ID:</strong> ${client.id} |
                    <strong>Name:</strong> ${client.name_surname} |
                    <strong>Email:</strong> ${client.email} |
                    <strong>Address:</strong> ${client.address} |
                    <strong>Phone:</strong> ${client.phone_number}
                    <button data-id="${client.id}" class="edit-btn">Edit</button>
                    <button data-id="${client.id}" class="delete-btn">Delete</button>
                </p>
            `;
            clientsList.appendChild(div);
        });

        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", () => startEdit(btn.dataset.id));
        });

        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", () => deleteClient(btn.dataset.id));
        });
}
// Начать редактирование
async function startEdit(id) {
    try {
        const res = await fetch("/clients/");
        if (!res.ok) {
            showMessage("Client not found", true);
            return;
        }
        const client = await res.json();

        clientIdInput.value = client.id;
        nameInput.value = client.name_surname;
        emailInput.value = client.email;
        addressInput.value = client.address;
        phoneInput.value = client.phone_number;

        formTitle.textContent = "Edit client";
        submitBtn.textContent = "Update";
        cancelEditBtn.style.display = "inline-block";
    } catch (err) {
        console.error(err);
        showMessage("Failed to load client", true);
    }
}

// Сброс формы
function resetForm() {
    clientIdInput.value = "";
    form.reset();
    formTitle.textContent = "Create client";
    submitBtn.textContent = "Create";
    cancelEditBtn.style.display = "none";
}

// submit – create или update
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        name_surname: nameInput.value,
        email: emailInput.value,
        address: addressInput.value,
        phone_number: phoneInput.value,
    };

    const id = clientIdInput.value;

    try {
        let res;
        if (id) {
            // UPDATE (PUT /client/<id>)
            res = await fetch("/clients/", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        } else {
            // CREATE (POST /client/)
            res = await fetch("/clients/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
        }

        const body = await res.json().catch(() => ({}));

        if (!res.ok) {
            showMessage("Save failed: " + (body.error || `HTTP ${res.status}`), true);
            return;
        }

        showMessage(id ? "Client updated" : "Client created");
        resetForm();
        loadClients();
    } catch (err) {
        console.error(err);
        showMessage("Request failed", true);
    }
});

cancelEditBtn.addEventListener("click", () => {
    resetForm();
});

// Удаление клиента
async function deleteClient(id) {
    if (!confirm("Delete this client?")) return;

    try {
        const res = await fetch("/clients/", {
            method: "DELETE",
        });

        const body = await res.json().catch(() => ({}));

        if (!res.ok) {
            showMessage("Delete failed: " + (body.error || `HTTP ${res.status}`), true);
            return;
        }

        showMessage("Client deleted");
        loadClients();
    } catch (err) {
        console.error(err);
        showMessage("Delete request failed", true);
    }
}

// Показ сообщения
function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "red" : "green";
}