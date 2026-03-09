async function callApi() {
    const token = await window.auth.getAccessToken();
    const API_BASE = "https://questionapi-hpfnddgpgmabc2hx.belgiumcentral-01.azurewebsites.net";

    const resp = await fetch(`${API_BASE}/api/test`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const text = await resp.text();
    document.getElementById("output").textContent = text;
}

window.addEventListener("DOMContentLoaded", async () => {
    try {
        await window.auth.initAuth();
        updateUI();

        const account = window.auth.getAccount();
        document.getElementById("output").textContent =
            account ? `Logged in as ${account.username || account.name}` : "Not signed in";
    } catch (e) {
        document.getElementById("output").textContent = "Startup failed: " + e;
    }
});

document.getElementById("loginBtn").addEventListener("click", async () => {
    try {
        await window.auth.login();
    } catch (e) {
        document.getElementById("output").textContent = "Login failed: " + e;
    }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
        await window.auth.logout();
    } catch (e) {
        document.getElementById("output").textContent = "Logout failed: " + e;
    }
});

document.getElementById("callApiBtn").addEventListener("click", async () => {
    try {
        await callApi();
    } catch (e) {
        document.getElementById("output").textContent = "API call failed: " + e;
    }
});

function updateUI() {
    const account = window.auth.getAccount();

    document.getElementById("loginBtn").style.display = account ? "none" : "inline-block";
    document.getElementById("logoutBtn").style.display = account ? "inline-block" : "none";
}