import { state, setDirty } from "./state.js";
import { clearError, showError, toastOk } from "./helpers.js";

// ---------- helpers ----------
export function bindDirtyTracking(sectionId, formId) {
    const form = $$(formId);
    if (!form) return;

    // track typed input
    form.getChildViews().forEach(function (v) {
        if (!v || typeof v.attachEvent !== "function") return;

        if (v.config && (v.config.view === "text" || v.config.view === "textarea")) {
            v.attachEvent("onTimedKeyPress", function () {
                setDirty(sectionId, true);
            });
        }

        if (typeof v.attachEvent === "function") {
            v.attachEvent("onChange", function () {
                setDirty(sectionId, true);
            });
        }
    });
}

export function buildPayloadFromForms() {
    const account = $$("form_account").getValues();
    const notifications = $$("form_notifications").getValues();
    const theme = $$("form_theme").getValues();
    const privacy = $$("form_privacy").getValues();

    // Password update is submitted separately (not stored)
    const pw = $$("form_password").getValues();
    const passwordUpdate =
        pw.newPassword && pw.newPassword.trim()
            ? {
                currentPassword: pw.currentPassword || "",
                newPassword: pw.newPassword || "",
            }
            : null;

    // Never persist password fields in preferences model
    const preferences = {
        account: {
            username: account.username,
            email: account.email,
        },
        notifications: {
            emailEnabled: !!notifications.emailEnabled,
            pushEnabled: !!notifications.pushEnabled,
            frequency: notifications.frequency,
            marketingEmails: !!notifications.marketingEmails,
            productUpdates: !!notifications.productUpdates,
        },
        theme: {
            mode: theme.mode,
            primaryColor: theme.primaryColor,
            fontSize: theme.fontSize,
            density: theme.density,
        },
        privacy: {
            profileVisibility: privacy.profileVisibility,
            dataSharingAnalytics: !!privacy.dataSharingAnalytics,
            dataSharingPersonalization: !!privacy.dataSharingPersonalization,
        },
        meta: state.loadedPreferences && state.loadedPreferences.meta
            ? state.loadedPreferences.meta
            : { updatedAt: null },
    };

    return { preferences: preferences, passwordUpdate: passwordUpdate };
}

export function validateAll() {
    clearError();

    const ok1 = $$("form_account").validate();
    const ok2 = $$("form_password").validate();
    const ok3 = $$("form_notifications").validate();
    const ok4 = $$("form_theme").validate();
    const ok5 = $$("form_privacy").validate();

    if (ok1 && ok2 && ok3 && ok4 && ok5) return true;

    showError("Please fix the highlighted fields before saving.");
    return false;
}

export function resetSection(sectionId) {
    if (!state.loadedPreferences) return;

    if (sectionId === "account") {
        $$("form_account").setValues(state.loadedPreferences.account, true);
        $$("form_password").setValues(
            { currentPassword: "", newPassword: "", confirmPassword: "" },
            true
        );
    }

    if (sectionId === "notifications") {
        $$("form_notifications").setValues(state.loadedPreferences.notifications, true);
    }

    if (sectionId === "theme") {
        $$("form_theme").setValues(state.loadedPreferences.theme, true);
    }

    if (sectionId === "privacy") {
        $$("form_privacy").setValues(state.loadedPreferences.privacy, true);
    }

    setDirty(sectionId, false);
    clearError();
    toastOk("Changes reverted.");
}
