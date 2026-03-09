const API_BASE = "https://questionapi-hpfnddgpgmabc2hx.belgiumcentral-01.azurewebsites.net";

function setOutput(message) {
    document.getElementById("output").textContent = message;
}

function updateUi() {
    const account = window.auth.getAccount();
    if (account) {
        setOutput(`Logged in as ${account.username || account.name || "user"} ✅`);
    } else {
        setOutput("Not signed in");
    }
}

async function callApi() {
    const token = await window.auth.getAccessToken();

    const resp = await fetch(`${API_BASE}/api/test`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const text = await resp.text();
    setOutput(text);
}

window.addEventListener("DOMContentLoaded", async () => {
    try {
        await window.auth.initAuth();
        updateUi();
    } catch (e) {
        setOutput("Startup auth error: " + e.message);
    }
});

document.getElementById("loginBtn").addEventListener("click", async () => {
    try {
        await window.auth.login();
        updateUi();
    } catch (e) {
        setOutput("Login failed: " + e.message);
    }
});

document.getElementById("callApiBtn").addEventListener("click", async () => {
    try {
        await callApi();
    } catch (e) {
        setOutput("API call failed: " + e.message);
    }
});