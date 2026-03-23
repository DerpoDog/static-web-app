const tenantId = "8c9cab84-3a29-4a80-ac5f-b144726d1431";
const clientId = "f6bb895b-5d53-4ea3-bbce-fa1f318764c8";
const apiClientId = "b55a8091-76a9-47c7-8c03-7f198d75680d";
const authorityHost = "testcustomers11.ciamlogin.com";

const redirectUri =
    window.location.hostname === "localhost"
        ? "http://localhost:64172"
        : "https://white-grass-051116610.1.azurestaticapps.net/";

const msalConfig = {
    auth: {
        clientId,
        authority: `https://${authorityHost}/${tenantId}/SignupSignin`,
        knownAuthorities: [authorityHost],
        redirectUri
    },
    cache: {
        cacheLocation: "localStorage"
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

const tokenRequest = {
    scopes: [`api://${apiClientId}/questions.read`]
};

async function initAuth() {
    await msalInstance.initialize();

    const params = new URLSearchParams(window.location.search);

    if (params.has("code")) {
        sessionStorage.setItem("signedIn", "true");
        history.replaceState({}, "", window.location.pathname);
    }

    try {
        const response = await msalInstance.handleRedirectPromise();
        if (response?.account) {
            msalInstance.setActiveAccount(response.account);
            sessionStorage.setItem("signedIn", "true");
        }
    } catch (e) {
        console.error("Redirect handling failed:", e);
    }

    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0]);
        sessionStorage.setItem("signedIn", "true");
    }
}

function getAccount() {
    return msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0] || null;
}

function isSignedIn() {
    return sessionStorage.getItem("signedIn") === "true";
}

function login() {
    const url =
        `https://${authorityHost}/${tenantId}/oauth2/v2.0/authorize` +
        `?client_id=${clientId}` +
        `&nonce=j9wIZ8iyjn` +
        `&redirect_uri=${encodeURIComponent(window.location.origin + "/")}` +
        `&scope=openid` +
        `&response_type=code` +
        `&prompt=login` +
        `&code_challenge_method=S256` +
        `&code_challenge=9uEcpjMgkHKUCMrR7rBlJA0wdAg3CL_MnHlCuwkl0cM`;

    window.location.href = url;
}

async function logout() {
    sessionStorage.removeItem("signedIn");
    localStorage.clear();

    const logoutUrl =
        `https://${authorityHost}/${tenantId}/oauth2/v2.0/logout` +
        `?post_logout_redirect_uri=${encodeURIComponent(window.location.origin)}`;

    window.location.href = logoutUrl;
}

async function getAccessToken() {
    const account = getAccount();

    if (!account) {
        await login();
        throw new Error("Redirecting to login...");
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
    getAccount,
    isSignedIn
};