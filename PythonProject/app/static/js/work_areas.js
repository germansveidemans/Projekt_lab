const areasList = document.getElementById("areas-list");
const form = document.getElementById("area-form");
const message = document.getElementById("message");

const areaIdInput = document.getElementById("area-id");
const nameInput = document.getElementById("name");

const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit");

// load all areas on page load
window.addEventListener("DOMContentLoaded", loadAreas);

async function loadAreas() {
    const res = await fetch("/work_areas/");
    const areas = await res.json();

    areasList.innerHTML = "";

    if (!areas.length) {
        areasList.innerHTML = "<p>No work areas yet.</p>";
        return;
    }

    areas.forEach(a => {
        const div = document.createElement("div");
        div.innerHTML = `
            <p>
                <strong>ID:</strong> ${a.id} |
                <strong>Name:</strong> ${a.name}
                <button class="edit-btn" data-id="${a.id}">Edit</button>
                <button class="delete-btn" data-id="${a.id}">Delete</button>
            </p>
        `;
        areasList.appendChild(div);
    });

    document.querySelectorAll(".edit-btn").forEach(btn =>
        btn.addEventListener("click", () => startEdit(btn.dataset.id))
    );
    document.querySelectorAll(".delete-btn").forEach(btn =>
        btn.addEventListener("click", () => deleteArea(btn.dataset.id))
    );
}

async function startEdit(id) {
    const res = await fetch("/work_areas/");
    if (!res.ok) {
        showMessage("Work area not found", true);
        return;
    }
    const a = await res.json();

    areaIdInput.value = a.id;
    nameInput.value = a.name;

    formTitle.textContent = "Edit work area";
    submitBtn.textContent = "Update";
    cancelEditBtn.style.display = "inline-block";
}

function resetForm() {
    areaIdInput.value = "";
    form.reset();
    formTitle.textContent = "Create work area";
    submitBtn.textContent = "Create";
    cancelEditBtn.style.display = "none";
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = { name: nameInput.value };
    const id = areaIdInput.value;

    if (id) {
        const res = await fetch("/work_areas/", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const err = await res.json();
            showMessage("Update failed: " + (err.error || res.statusText), true);
            return;
        }
        showMessage("Work area updated");
    } else {
        const res = await fetch("/work_areas/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const err = await res.json();
            showMessage("Create failed: " + (err.error || res.statusText), true);
            return;
        }
        showMessage("Work area created");
    }

    resetForm();
    loadAreas();
});

cancelEditBtn.addEventListener("click", () => resetForm());

async function deleteArea(id) {
    if (!confirm("Delete this work area?")) return;

    const res = await fetch("/work_areas/", {
        method: "DELETE",
    });

    if (!res.ok) {
        const err = await res.json();
        showMessage("Delete failed: " + (err.error || res.statusText), true);
        return;
    }

    showMessage("Work area deleted");
    loadAreas();
}

function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "red" : "green";
}