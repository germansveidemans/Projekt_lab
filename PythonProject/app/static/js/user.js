const usersList = document.getElementById("users-list");
const form = document.getElementById("user-form");
const message = document.getElementById("message");

const userIdInput = document.getElementById("user-id");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const roleInput = document.getElementById("role");
const workAreaInput = document.getElementById("work_area_id");

const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit");

// ielādē lietotājus, kad lapa atveras
window.addEventListener("DOMContentLoaded", loadUsers);

async function loadUsers() {
    const res = await fetch("/users/");  // url_prefix = "/users"
    const users = await res.json();

    usersList.innerHTML = "";

    if (users.length === 0) {
        usersList.innerHTML = "<p>No users yet.</p>";
        return;
    }

    users.forEach(user => {
        const div = document.createElement("div");
        div.innerHTML = `
            <p>
                <strong>ID:</strong> ${user.id} |
                <strong>Username:</strong> ${user.username} |
                <strong>Role:</strong> ${user.role} |
                <strong>Work area ID:</strong> ${user.work_area_id ?? "-"}
                <button class="edit-btn" data-id="${user.id}">Edit</button>
                <button class="delete-btn" data-id="${user.id}">Delete</button>
            </p>
        `;
        usersList.appendChild(div);
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => startEdit(btn.dataset.id));
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", () => deleteUser(btn.dataset.id));
    });
}

async function startEdit(id) {
    const res = await fetch(`/users/${id}`);
    if (!res.ok) {
        showMessage("User not found", true);
        return;
    }

    const user = await res.json();

    userIdInput.value = user.id;
    usernameInput.value = user.username;
    passwordInput.value = user.password;   // īstā dzīvē paroles front-endā tā nerādām :)
    roleInput.value = user.role;
    workAreaInput.value = user.work_area_id ?? "";

    formTitle.textContent = "Edit user";
    submitBtn.textContent = "Update";
    cancelEditBtn.style.display = "inline-block";
}

function resetForm() {
    userIdInput.value = "";
    form.reset();
    formTitle.textContent = "Create user";
    submitBtn.textContent = "Create";
    cancelEditBtn.style.display = "none";
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const workAreaIdRaw = workAreaInput.value;
    const data = {
        username: usernameInput.value,
        password: passwordInput.value,
        role: roleInput.value,
        work_area_id: workAreaIdRaw ? Number(workAreaIdRaw) : null,
    };

    const id = userIdInput.value;

    if (id) {
        // UPDATE
        const res = await fetch(`/users/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const err = await res.json();
            showMessage("Update failed: " + (err.error || res.statusText), true);
            return;
        }

        showMessage("User updated");
    } else {
        // CREATE
        const res = await fetch("/users/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const err = await res.json();
            showMessage("Create failed: " + (err.error || res.statusText), true);
            return;
        }

        showMessage("User created");
    }

    resetForm();
    loadUsers();
});

cancelEditBtn.addEventListener("click", () => resetForm());

async function deleteUser(id) {
    if (!confirm("Delete this user?")) return;

    const res = await fetch(`/users/${id}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        const err = await res.json();
        showMessage("Delete failed: " + (err.error || res.statusText), true);
        return;
    }

    showMessage("User deleted");
    loadUsers();
}

function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "red" : "green";
}