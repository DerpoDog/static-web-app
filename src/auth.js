const tenantId = "8c9cab84-3a29-4a80-ac5f-b144726d1431";
const clientId = "bb2a932d-33f5-4ab4-bfc0-6f0fa041e83d";
const apiClientId = "ad8b0367-13c2-49f2-8b43-a3bdd565efdf";
const authorityHost = "testcustomers11.ciamlogin.com";

const redirectUri = "https://white-grass-051116610.1.azurestaticapps.net/"

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

    await msalInstance.handleRedirectPromise();

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
    return !!getAccount();
}

async function login() {
    await msalInstance.loginRedirect(tokenRequest);
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