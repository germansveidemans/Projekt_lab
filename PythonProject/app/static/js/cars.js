const carsList = document.getElementById("cars-list");
const form = document.getElementById("car-form");
const message = document.getElementById("message");

const carIdInput = document.getElementById("car-id");
const sizeInput = document.getElementById("size");
const weightInput = document.getElementById("weight");
const vehicleNumberInput = document.getElementById("vehicle_number");
const userIdInput = document.getElementById("user_id");

const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit");

// Ielādē visas automašīnas, atverot lapu
window.addEventListener("DOMContentLoaded", loadCars);

async function loadCars() {
    const res = await fetch("/cars/");
    const cars = await res.json();

    carsList.innerHTML = "";

    if (cars.length === 0) {
        carsList.innerHTML = "<p>No cars yet.</p>";
        return;
    }

    cars.forEach(car => {
        const div = document.createElement("div");
        div.innerHTML = `
            <p>
                <strong>ID:</strong> ${car.id} |
                <strong>Number:</strong> ${car.vehicle_number} |
                <strong>Size:</strong> ${car.size} |
                <strong>Weight:</strong> ${car.weight} |
                <strong>User:</strong> ${car.user_id}
                <button data-id="${car.id}" class="edit-btn">Edit</button>
                <button data-id="${car.id}" class="delete-btn">Delete</button>
            </p>
        `;
        carsList.appendChild(div);
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => startEdit(btn.dataset.id));
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", () => deleteCar(btn.dataset.id));
    });
}

async function startEdit(id) {
    const res = await fetch(`/cars/${id}`);
    if (!res.ok) {
        showMessage("Car not found", true);
        return;
    }
    const car = await res.json();

    carIdInput.value = car.id;
    sizeInput.value = car.size;
    weightInput.value = car.weight;
    vehicleNumberInput.value = car.vehicle_number;
    userIdInput.value = car.user_id;

    formTitle.textContent = "Edit car";
    submitBtn.textContent = "Update";
    cancelEditBtn.style.display = "inline-block";
}

function resetForm() {
    carIdInput.value = "";
    form.reset();
    formTitle.textContent = "Create car";
    submitBtn.textContent = "Create";
    cancelEditBtn.style.display = "none";
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        size: sizeInput.value,
        weight: Number(weightInput.value),
        vehicle_number: vehicleNumberInput.value,
        user_id: Number(userIdInput.value),
    };

    const id = carIdInput.value;

    if (id) {
        // ATJAUNINĀT (PUT /cars/<id>)
        const res = await fetch(`/cars/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const err = await res.json();
            showMessage("Update failed: " + (err.error || res.statusText), true);
            return;
        }
        showMessage("Car updated");
    } else {
        // IZVEIDOT (POST /cars/)
        const res = await fetch("/cars/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const err = await res.json();
            showMessage("Create failed: " + (err.error || res.statusText), true);
            return;
        }
        showMessage("Car created");
    }

    resetForm();
    loadCars();
});

cancelEditBtn.addEventListener("click", () => {
    resetForm();
});

async function deleteCar(id) {
    if (!confirm("Delete this car?")) return;

    const res = await fetch(`/cars/${id}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        const err = await res.json();
        showMessage("Delete failed: " + (err.error || res.statusText), true);
        return;
    }

    showMessage("Car deleted");
    loadCars();
}

function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "red" : "green";
}