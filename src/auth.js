const tenantId = "8c9cab84-3a29-4a80-ac5f-b144726d1431";
const clientId = "8ca78a18-64c4-428b-9d38-dec2694411fd";
const apiClientId = "b55a8091-76a9-47c7-8c03-7f198d75680d";
const authorityHost = "testcustomers11.ciamlogin.com";

const msalConfig = {
    auth: {
        clientId: "8ca78a18-64c4-428b-9d38-dec2694411fd",
        authority: "https://testcustomers11.ciamlogin.com/8c9cab84-3a29-4a80-ac5f-b144726d1431/Signupsignin",
        knownAuthorities: ["testcustomers11.ciamlogin.com"],
        redirectUri: window.location.origin
    },
    cache: {
        cacheLocation: "localStorage"
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

const loginRequest = {
    scopes: ["openid", "profile", "offline_access"]
};

const tokenRequest = {
    scopes: [`api://${apiClientId}/questions.read`]
};

async function initAuth() {
    await msalInstance.initialize();

    const response = await msalInstance.handleRedirectPromise();
    if (response?.account) {
        msalInstance.setActiveAccount(response.account);
    }

    const accounts = msalInstance.getAllAccounts();
    if (!msalInstance.getActiveAccount() && accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0]);
    }
}

function getAccount() {
    return msalInstance.getActiveAccount();
}

function login() {
    const url =
        "https://testcustomers11.ciamlogin.com/8c9cab84-3a29-4a80-ac5f-b144726d1431/oauth2/v2.0/authorize?client_id=f6bb895b-5d53-4ea3-bbce-fa1f318764c8&nonce=j9wIZ8iyjn&redirect_uri=https://white-grass-051116610.1.azurestaticapps.net/&scope=openid&response_type=code&prompt=login&code_challenge_method=S256&code_challenge=9uEcpjMgkHKUCMrR7rBlJA0wdAg3CL_MnHlCuwkl0cM";
    window.location.href = url;
}

async function logout() {
    const account = getAccount();

    if (!account) return;

    await msalInstance.logoutPopup({
        account,
        mainWindowRedirectUri: window.location.origin
    });
}

async function getAccessToken() {
    let account = getAccount();

    if (!account) {
        const loginResult = await login();
        account = loginResult.account;
    }

    try {
        const result = await msalInstance.acquireTokenSilent({
            ...tokenRequest,
            account
        });
        return result.accessToken;
    } catch (e) {
        const result = await msalInstance.acquireTokenPopup({
            ...tokenRequest,
            account
        });
        return result.accessToken;
    }
}

window.auth = {
    initAuth,
    login,
    logout,
    getAccessToken,
    getAccount
};