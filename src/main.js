// main.js

async function callApi() {
    const token = await window.auth.getAccessToken();
    const API_BASE = "https://questionapi-hpfnddgpgmabc2hx.belgiumcentral-01.azurewebsites.net";
    const resp = await fetch("${API_BASE}/api/test", {
        headers: { Authorization: `Bearer ${token}` }
    });

    const text = await resp.text();
    document.getElementById("output").textContent = text;
}

document.getElementById("loginBtn").addEventListener("click", async () => {
    await window.auth.login();
    document.getElementById("output").textContent = "Logged in ✅";
});

document.getElementById("callApiBtn").addEventListener("click", async () => {
    try {
        await callApi();
    } catch (e) {
        document.getElementById("output").textContent = "API call failed: " + e;
    }
});