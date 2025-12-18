(function (root, factory) {
    if (typeof module === "object" && module.exports) module.exports = factory();
    else root.PreferencesAPI = factory();
})(typeof self !== "undefined" ? self : this, function () {
    const API_BASE = "http://127.0.0.1:8000";
    const TOKEN_KEY = "auth_token_v1";

    function getToken() {
        return localStorage.getItem(TOKEN_KEY) || "";
    }

    function setToken(token) {
        if (token) localStorage.setItem(TOKEN_KEY, token);
    }

    function clearToken() {
        localStorage.removeItem(TOKEN_KEY);
    }

    async function http(path, { method = "GET", headers = {}, body } = {}) {
        const token = getToken();

        const finalHeaders = {
            "Content-Type": "application/json",
            ...headers,
        };

        if (token) {
            finalHeaders["Authorization"] = "Token " + token;
        }

        const res = await fetch(API_BASE + path, {
            method,
            headers: finalHeaders,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });

        const text = await res.text();
        let data = null;
        try {
            data = text ? JSON.parse(text) : null;
        } catch (e) {
            data = text;
        }

        if (!res.ok) {
            const message =
                (data && (data.error || data.detail)) ||
                (typeof data === "string" && data) ||
                "Request failed (" + res.status + ")";
            const err = new Error(message);
            err.status = res.status;
            err.data = data;
            throw err;
        }

        return data;
    }

    let cachedPreferencesId = null;

    function normalizePreferencesShape(prefs) {
        return {
            account: prefs && prefs.account ? prefs.account : { username: "", email: "" },
            notifications:
                prefs && prefs.notifications
                    ? prefs.notifications
                    : {
                        emailEnabled: true,
                        pushEnabled: false,
                        frequency: "daily",
                        marketingEmails: false,
                        productUpdates: true,
                    },
            theme:
                prefs && prefs.theme
                    ? prefs.theme
                    : {
                        mode: "system",
                        primaryColor: "#4f46e5",
                        fontSize: "medium",
                        density: "comfortable",
                    },
            privacy:
                prefs && prefs.privacy
                    ? prefs.privacy
                    : {
                        profileVisibility: "contacts",
                        dataSharingAnalytics: false,
                        dataSharingPersonalization: true,
                    },
            meta: prefs && prefs.meta ? prefs.meta : { updatedAt: null },
            id: prefs && (prefs.id || prefs.pk) ? (prefs.id || prefs.pk) : undefined,
        };
    }

    async function login({ username, password }) {
        const data = await http("/api/auth/login/", {
            method: "POST",
            body: { username, password },
        });

        if (data && data.token) setToken(data.token);

        if (data && data.preferences) {
            const normalized = normalizePreferencesShape(data.preferences);
            if (normalized.id) cachedPreferencesId = normalized.id;
            return { ...data, preferences: normalized };
        }

        return data;
    }

    async function signup({ username, email, password }) {
        const data = await http("/api/auth/signup/", {
            method: "POST",
            body: { username, email, password },
        });

        if (data && data.token) setToken(data.token);

        if (data && data.preferences) {
            const normalized = normalizePreferencesShape(data.preferences);
            if (normalized.id) cachedPreferencesId = normalized.id;
            return { ...data, preferences: normalized };
        }

        return data;
    }

    function logout() {
        clearToken();
        cachedPreferencesId = null;
    }

    async function getPreferences() {
        const prefs = await http("/api/preferences/me/", { method: "GET" });

        const normalized = normalizePreferencesShape(prefs);

        if (normalized.id) cachedPreferencesId = normalized.id;

        return normalized;
    }

    async function savePreferences(payload) {
        const prefs = payload && payload.preferences ? payload.preferences : payload;

        if (!cachedPreferencesId) {
            const current = await getPreferences();
            if (current && current.id) cachedPreferencesId = current.id;
        }

        if (!cachedPreferencesId) {
            throw new Error(
                "Cannot save preferences because preferences id was not found. Ensure the serializer returns an 'id' field."
            );
        }

        const saved = await http("/api/preferences/" + cachedPreferencesId + "/", {
            method: "PATCH",
            body: prefs,
        });

        const normalized = normalizePreferencesShape(saved);
        if (normalized.id) cachedPreferencesId = normalized.id;

        return { ok: true, saved: normalized };
    }

    return {
        login,
        signup,
        logout,
        getPreferences,
        savePreferences,
    };
});
