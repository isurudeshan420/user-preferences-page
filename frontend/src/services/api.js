(function (root, factory) {
    if (typeof module === "object" && module.exports) module.exports = factory();
    else root.PreferencesAPI = factory();
})(typeof self !== "undefined" ? self : this, function () {
    const STORAGE_KEY = "user_preferences_v1";

    const DEFAULT_PREFERENCES = {
        account: {
            username: "jane.doe",
            email: "jane.doe@example.com",
        },
        notifications: {
            emailEnabled: true,
            pushEnabled: false,
            frequency: "daily", // instant | daily | weekly
            marketingEmails: false,
            productUpdates: true,
        },
        theme: {
            mode: "system", // system | light | dark
            primaryColor: "#4f46e5",
            fontSize: "medium", // small | medium | large
            density: "comfortable", // comfortable | compact
        },
        privacy: {
            profileVisibility: "contacts", // public | contacts | private
            dataSharingAnalytics: false,
            dataSharingPersonalization: true,
        },
        meta: {
            updatedAt: null,
        },
    };

    function sleep(ms) {
        return new Promise((r) => setTimeout(r, ms));
    }

    function safeParse(json) {
        try {
            return JSON.parse(json);
        } catch (e) {
            return null;
        }
    }

    function mergeDeep(target, source) {
        const out = Array.isArray(target) ? target.slice() : { ...target };
        Object.keys(source || {}).forEach((k) => {
            const sv = source[k];
            const tv = out[k];
            if (sv && typeof sv === "object" && !Array.isArray(sv)) out[k] = mergeDeep(tv || {}, sv);
            else out[k] = sv;
        });
        return out;
    }

    async function getPreferences() {
        await sleep(250);
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_PREFERENCES;

        const parsed = safeParse(raw);
        if (!parsed) return DEFAULT_PREFERENCES;

        return mergeDeep(DEFAULT_PREFERENCES, parsed);
    }

    /**
     * Save preferences (passwordUpdate is accepted but not stored client-side).
     * payload = { preferences: <prefs>, passwordUpdate?: { currentPassword, newPassword } }
     */
    async function savePreferences(payload) {
        await sleep(350);

        // Simulate occasional backend failure (set to 0 to disable)
        const FAIL_RATE = 0.08;
        if (Math.random() < FAIL_RATE) {
            const err = new Error("Failed to save due to a simulated network issue. Please retry.");
            err.code = "NETWORK_SIMULATED";
            throw err;
        }

        const prefs = payload && payload.preferences ? payload.preferences : payload;

        const toStore = mergeDeep(prefs || DEFAULT_PREFERENCES, {
            meta: { updatedAt: new Date().toISOString() },
        });

        // Do not store any password fields in localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));

        return { ok: true, saved: toStore };
    }

    return {
        DEFAULT_PREFERENCES,
        getPreferences,
        savePreferences,
    };
});
