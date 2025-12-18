import { state, setDirty } from "./state.js";
import { showError } from "./helpers.js";
import { bindDirtyTracking } from "./forms.js";
import { buildMenuPopup, buildLayout } from "./ui/ui.js";

export function initUserPreferencesPage() {
    // Build popup + layout
    buildMenuPopup();
    buildLayout();

    // Track dirtiness per section
    bindDirtyTracking("account", "form_account");
    bindDirtyTracking("account", "form_password");
    bindDirtyTracking("notifications", "form_notifications");
    bindDirtyTracking("theme", "form_theme");
    bindDirtyTracking("privacy", "form_privacy");

    // Responsive: show hamburger on small screens, hide sidebar
    function applyResponsive() {
        const w = document.documentElement.clientWidth || window.innerWidth || 1024;
        const isMobile = w <= 768;

        const menuBtn = $$("menuBtn");
        const side = $$("categoryList");

        if (isMobile) {
            menuBtn.show();
            side.hide();
        } else {
            menuBtn.hide();
            side.show();
            if ($$("categoryPopup")) $$("categoryPopup").hide();
        }
    }

    webix.event(window, "resize", function () {
        applyResponsive();
    });

    // Initial selection
    $$("categoryList").select("account");

    // Load preferences
    (async function init() {
        try {
            webix.extend($$("root"), webix.ProgressBar);
            $$("root").showProgress({ type: "icon" });

            state.loadedPreferences = await PreferencesAPI.getPreferences();

            $$("form_account").setValues(state.loadedPreferences.account, true);
            $$("form_notifications").setValues(state.loadedPreferences.notifications, true);
            $$("form_theme").setValues(state.loadedPreferences.theme, true);
            $$("form_privacy").setValues(state.loadedPreferences.privacy, true);
            $$("form_password").setValues(
                { currentPassword: "", newPassword: "", confirmPassword: "" },
                true
            );

            setDirty("account", false);
            setDirty("notifications", false);
            setDirty("theme", false);
            setDirty("privacy", false);

            applyResponsive();
        } catch (e) {
            showError("Failed to load preferences. Please refresh and try again.");
        } finally {
            $$("root").hideProgress();
        }
    })();
}
