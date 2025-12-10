const clientsList = document.getElementById("cars-list");
const form = document.getElementById("car-form");
const message = document.getElementById("message");

const clientIdInput = document.getElementById("car-id");
const nameInput = document.getElementById("size");
const emailInput = document.getElementById("weight");
const addressInput = document.getElementById("vehicle_number");
const phoneInput = document.getElementById("user_id");

const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit");

// Ielādē klientu sarakstu, kad atver lapu
window.addEventListener("DOMContentLoaded", loadClients);

async function loadClients() {
    const res = await fetch("/clients/");
    const clients = await res.json();

    clientsList.innerHTML = "";

    if (clients.length === 0) {
        clientsList.innerHTML = "<p>No clients yet.</p>";
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

// Sāk rediģēšanu
async function startEdit(id) {
    const res = await fetch(`/client/${id}`);
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
}

// Atiestata formu uz "Create" režīmu
function resetForm() {
    clientIdInput.value = "";
    form.reset();
    formTitle.textContent = "Create client";
    submitBtn.textContent = "Create";
    cancelEditBtn.style.display = "none";
}

// Formas submit – create vai update
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        name_surname: nameInput.value,
        email: emailInput.value,
        address: addressInput.value,
        phone_number: phoneInput.value,
    };

    const id = clientIdInput.value;

    if (id) {
        // UPDATE (PUT /client/<id>)
        const res = await fetch(`/client/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const err = await res.json();
            showMessage("Update failed: " + (err.error || res.statusText), true);
            return;
        }
        showMessage("Client updated");
    } else {
        // CREATE (POST /client/)
        const res = await fetch("/client/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const err = await res.json();
            showMessage("Create failed: " + (err.error || res.statusText), true);
            return;
        }
        showMessage("Client created");
    }

    resetForm();
    loadClients();
});

cancelEditBtn.addEventListener("click", () => {
    resetForm();
});

// Dzēst klientu
async function deleteClient(id) {
    if (!confirm("Delete this client?")) return;

    const res = await fetch(`/client/${id}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        const err = await res.json();
        showMessage("Delete failed: " + (err.error || res.statusText), true);
        return;
    }

    showMessage("Client deleted");
    loadClients();
}

// Palīgfunkcija paziņojumu rādīšanai
function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "red" : "green";
}