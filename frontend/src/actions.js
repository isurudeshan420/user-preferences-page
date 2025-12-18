import { state, currentSectionId, setDirty } from "./state.js";
import { clearError, showError, toastOk, toastFail } from "./helpers.js";
import { buildPayloadFromForms, validateAll } from "./forms.js";

export async function saveAll() {
    if (!validateAll()) {
        toastFail("Fix validation errors and try again.");
        return;
    }

    const payload = buildPayloadFromForms();

    const btn = $$("saveAllBtn");
    btn.define("disabled", true);
    btn.define("value", "Saving...");
    btn.refresh();

    try {
        const res = await PreferencesAPI.savePreferences(payload);
        state.loadedPreferences = res.saved;

        // Clear password fields after successful save
        $$("form_password").setValues(
            { currentPassword: "", newPassword: "", confirmPassword: "" },
            true
        );

        state.dirtySections.clear();
        setDirty(currentSectionId(), false);
        setDirty("account", false);
        setDirty("notifications", false);
        setDirty("theme", false);
        setDirty("privacy", false);

        toastOk("Preferences saved successfully.");
        clearError();
    } catch (e) {
        toastFail(e && e.message ? e.message : "Failed to save preferences.");
        showError(e && e.message ? e.message : "Failed to save preferences.");
    } finally {
        btn.define("value", "Save All");
        btn.define("disabled", !state.dirty);
        btn.refresh();
    }
}
