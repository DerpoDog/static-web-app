const tenantId = "8c9cab84-3a29-4a80-ac5f-b144726d1431";
const clientId = "bb2a932d-33f5-4ab4-bfc0-6f0fa041e83d";
const apiClientId = "718fbb7e-ef73-4f05-a642-ec2aad4150fa";
const authorityHost = "testcustomers11.ciamlogin.com";

const redirectUri = "https://white-grass-051116610.1.azurestaticapps.net/";
const postLogoutRedirectUri = "https://white-grass-051116610.1.azurestaticapps.net/login.html";

const msalConfig = {
    auth: {
        clientId: clientId,
        authority: `https://${authorityHost}/${tenantId}`,
        knownAuthorities: [authorityHost],
        redirectUri: redirectUri,
        postLogoutRedirectUri: postLogoutRedirectUri
    },
    cache: {
        cacheLocation: "localStorage"
    }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

const loginRequest = {
    scopes: ["openid", "profile", "email"]
};

const apiTokenRequest = {
    scopes: [`api://${apiClientId}/questions.read`]
};

const graphTokenRequest = {
    scopes: ["User.Read", "User.ReadWrite"]
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
    return msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0] || null;
}

function isSignedIn() {
    return !!getAccount();
}

async function login() {
    await msalInstance.loginRedirect(loginRequest);
}

async function logout() {
    await msalInstance.logoutRedirect();
}

async function acquireToken(request) {
    const account = getAccount();

    if (!account) {
        await login();
        return null;
    }

    try {
        const result = await msalInstance.acquireTokenSilent({
            ...request,
            account
        });
        return result.accessToken;
    } catch (e) {
        await msalInstance.acquireTokenRedirect({
            ...request,
            account
        });
        return null;
    }
}

async function getAccessToken() {
    return acquireToken(apiTokenRequest);
}

async function getGraphAccessToken() {
    return acquireToken(graphTokenRequest);
}

async function getMyProfile() {
    const token = await getGraphAccessToken();
    if (!token) return null;

    const response = await fetch("https://graph.microsoft.com/v1.0/me?$select=id,displayName,givenName,surname,country,mail,userPrincipalName", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Graph profile read failed: ${response.status} ${text}`);
    }

    return response.json();
}

async function updateMyProfile(profile) {
    const token = await getGraphAccessToken();
    if (!token) return null;

    const payload = {
        displayName: profile.displayName,
        givenName: profile.givenName,
        surname: profile.surname,
        country: profile.country
    };

    Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
            delete payload[key];
        }
    });

    const response = await fetch("https://graph.microsoft.com/v1.0/me", {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Graph profile update failed: ${response.status} ${text}`);
    }

    return true;
}

window.auth = {
    initAuth,
    login,
    logout,
    getAccessToken,
    getGraphAccessToken,
    getMyProfile,
    updateMyProfile,
    getAccount,
    isSignedIn
};