const ordersList = document.getElementById("orders-list");
const form = document.getElementById("order-form");
const message = document.getElementById("message");

const orderIdInput = document.getElementById("order-id");
const routeIdInput = document.getElementById("route_id");
const sequenceInput = document.getElementById("sequence");
const sizeInput = document.getElementById("size");
const weightInput = document.getElementById("weight");
const clientIdInput = document.getElementById("client_id");
const addressInput = document.getElementById("address");
const expectedInput = document.getElementById("expected_delivery_time");
const statusInput = document.getElementById("route_status");
const actualInput = document.getElementById("actual_delivery_time");

const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit");

window.addEventListener("DOMContentLoaded", loadOrders);

async function loadOrders() {
    const res = await fetch("/orders/");
    const orders = await res.json();

    ordersList.innerHTML = "";

    if (!orders.length) {
        ordersList.innerHTML = "<p>No orders yet.</p>";
        return;
    }

    orders.forEach(order => {
        const div = document.createElement("div");
        div.innerHTML = `
            <p>
                <strong>ID:</strong> ${order.id} |
                <strong>Route:</strong> ${order.route_id ?? "-"} |
                <strong>Seq:</strong> ${order.sequence} |
                <strong>Size:</strong> ${order.size} |
                <strong>Weight:</strong> ${order.weight} |
                <strong>Client:</strong> ${order.client_id ?? "-"} |
                <strong>Status:</strong> ${order.route_status}
                <button class="edit-btn" data-id="${order.id}">Edit</button>
                <button class="delete-btn" data-id="${order.id}">Delete</button>
            </p>
        `;
        ordersList.appendChild(div);
    });

    document.querySelectorAll(".edit-btn").forEach(btn =>
        btn.addEventListener("click", () => startEdit(btn.dataset.id))
    );
    document.querySelectorAll(".delete-btn").forEach(btn =>
        btn.addEventListener("click", () => deleteOrder(btn.dataset.id))
    );
}

async function startEdit(id) {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) {
        showMessage("Order not found", true);
        return;
    }
    const o = await res.json();

    orderIdInput.value = o.id;
    routeIdInput.value = o.route_id ?? "";
    sequenceInput.value = o.sequence;
    sizeInput.value = o.size;
    weightInput.value = o.weight;
    clientIdInput.value = o.client_id ?? "";
    addressInput.value = o.address ?? "";
    expectedInput.value = o.expected_delivery_time ?? "";
    statusInput.value = o.route_status ?? "";
    actualInput.value = o.actual_delivery_time ?? "";

    formTitle.textContent = "Edit order";
    submitBtn.textContent = "Update";
    cancelEditBtn.style.display = "inline-block";
}

function resetForm() {
    orderIdInput.value = "";
    form.reset();
    formTitle.textContent = "Create order";
    submitBtn.textContent = "Create";
    cancelEditBtn.style.display = "none";
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        route_id: routeIdInput.value ? Number(routeIdInput.value) : null,
        sequence: Number(sequenceInput.value),
        size: Number(sizeInput.value),
        weight: Number(weightInput.value),
        client_id: clientIdInput.value ? Number(clientIdInput.value) : null,
        address: addressInput.value || null,
        expected_delivery_time: expectedInput.value,
        route_status: statusInput.value,
        actual_delivery_time: actualInput.value || null,
    };

    const id = orderIdInput.value;

    if (id) {
        const res = await fetch(`${BASE_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json();
            showMessage("Update failed: " + (err.error || res.statusText), true);
            return;
        }
        showMessage("Order updated");
    } else {
        const res = await fetch(`${BASE_URL}/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json();
            showMessage("Create failed: " + (err.error || res.statusText), true);
            return;
        }
        showMessage("Order created");
    }

    resetForm();
    loadOrders();
});

cancelEditBtn.addEventListener("click", () => resetForm());

async function deleteOrder(id) {
    if (!confirm("Delete this order?")) return;

    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        const err = await res.json();
        showMessage("Delete failed: " + (err.error || res.statusText), true);
        return;
    }
    showMessage("Order deleted");
    loadOrders();
}

function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "red" : "green";
}