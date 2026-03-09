// auth.js

const tenantId = "8c9cab84-3a29-4a80-ac5f-b144726d1431";
const clientId = "8ca78a18-64c4-428b-9d38-dec2694411fd";
const apiClientId = "<QUESTION_API_CLIENT_ID>";
const policy = "SignupSignin";

// IMPORTANT: use the SAME domain you see when clicking "Run user flow"
const authorityBase = "https://<YOUR_DOMAIN_FROM_RUN_USER_FLOW>";
// Example: https://testcustomers11.ciamlogin.com  (or login.microsoftonline.com)

const msalConfig = {
    auth: {
        clientId,
        authority: `${authorityBase}/${tenantId}/${policy}`,
        redirectUri: window.location.origin
    },
    cache: {
        cacheLocation: "localStorage"
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

const tokenRequest = {
    scopes: [`api://${apiClientId}/questions.read`]
};

async function login() {
    await msalInstance.initialize();
    return msalInstance.loginPopup(tokenRequest);
}

async function getAccessToken() {
    await msalInstance.initialize();

    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) {
        await login();
    }

    const account = msalInstance.getAllAccounts()[0];

    try {
        const result = await msalInstance.acquireTokenSilent({
            ...tokenRequest,
            account
        });
        return result.accessToken;
    } catch (e) {
        // fallback if silent fails
        const result = await msalInstance.acquireTokenPopup(tokenRequest);
        return result.accessToken;
    }
}

// expose to main.js
window.auth = { login, getAccessToken };