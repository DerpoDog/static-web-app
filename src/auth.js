const tenantId = "8c9cab84-3a29-4a80-ac5f-b144726d1431";
const clientId = "8ca78a18-64c4-428b-9d38-dec2694411fd";
const apiClientId = "b55a8091-76a9-47c7-8c03-7f198d75680d";
const policy = "SignupSignin";

// Use the same domain shown by your External ID / user flow setup
const authorityBase = "https://testcustomers11.ciamlogin.com";

const msalConfig = {
    auth: {
        clientId,
        authority: `${authorityBase}/${tenantId}/${policy}`,
        redirectUri: window.location.origin,
        postLogoutRedirectUri: window.location.origin
    },
    cache: {
        cacheLocation: "localStorage"
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

const loginRequest = {
    scopes: ["openid", "profile", "offline_access"]
};

const apiTokenRequest = {
    scopes: [`api://${apiClientId}/questions.read`]
};

async function initAuth() {
    await msalInstance.initialize();

    const response = await msalInstance.handleRedirectPromise();
    if (response?.account) {
        msalInstance.setActiveAccount(response.account);
    }

    const active = msalInstance.getActiveAccount();
    if (!active) {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
            msalInstance.setActiveAccount(accounts[0]);
        }
    }
}

function getAccount() {
    return msalInstance.getActiveAccount();
}

async function login() {
    const result = await msalInstance.loginPopup(loginRequest);
    msalInstance.setActiveAccount(result.account);
    return result;
}

// Use this instead if you want full-page redirect instead of popup:
// async function login() {
//   return msalInstance.loginRedirect(loginRequest);
// }

async function getAccessToken() {
    let account = getAccount();

    if (!account) {
        const loginResult = await login();
        account = loginResult.account;
    }

    try {
        const result = await msalInstance.acquireTokenSilent({
            ...apiTokenRequest,
            account
        });
        return result.accessToken;
    } catch (e) {
        const result = await msalInstance.acquireTokenPopup({
            ...apiTokenRequest,
            account
        });
        return result.accessToken;
    }
}

async function logout() {
    const account = getAccount();
    if (account) {
        await msalInstance.logoutPopup({ account });
    }
}

window.auth = {
    initAuth,
    login,
    logout,
    getAccessToken,
    getAccount
};