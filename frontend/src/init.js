import { state, setDirty } from "./state.js";
import { showError, toastOk, toastFail } from "./helpers.js";
import { bindDirtyTracking } from "./forms.js";
import { buildMenuPopup, buildLayout } from "./ui/ui.js";

function hasToken() {
    return !!localStorage.getItem("auth_token_v1");
}

function openAuthWindow(onSuccess) {
    const win = webix.ui({
        view: "window",
        id: "authWin",
        modal: true,
        position: "center",
        width: 520,
        head: "Authentication",
        body: {
            rows: [
                {
                    view: "tabview",
                    cells: [
                        {
                            header: "Sign In",
                            body: {
                                view: "form",
                                id: "signinForm",
                                padding: 16,
                                elementsConfig: { labelPosition: "top" },
                                elements: [
                                    { view: "text", name: "username", label: "Username", required: true },
                                    { view: "text", name: "password", label: "Password", type: "password", required: true },
                                    { height: 10 },
                                    {
                                        cols: [
                                            {},
                                            {
                                                view: "button",
                                                value: "Sign In",
                                                css: "webix_primary",
                                                width: 140,
                                                click: async function () {
                                                    const form = $$("signinForm");
                                                    if (!form.validate()) return;

                                                    const btn = this;
                                                    btn.disable();
                                                    try {
                                                        const v = form.getValues();
                                                        await PreferencesAPI.login({ username: v.username, password: v.password });
                                                        toastOk("Signed in.");
                                                        $$("authWin").close();
                                                        onSuccess();
                                                    } catch (e) {
                                                        toastFail(e && e.message ? e.message : "Sign in failed.");
                                                    } finally {
                                                        btn.enable();
                                                    }
                                                },
                                            },
                                        ],
                                    },
                                ],
                                rules: {
                                    username: webix.rules.isNotEmpty,
                                    password: webix.rules.isNotEmpty,
                                },
                            },
                        },
                        {
                            header: "Sign Up",
                            body: {
                                view: "form",
                                id: "signupForm",
                                padding: 16,
                                elementsConfig: { labelPosition: "top" },
                                elements: [
                                    { view: "text", name: "username", label: "Username", required: true },
                                    { view: "text", name: "email", label: "Email (optional)" },
                                    { view: "text", name: "password", label: "Password", type: "password", required: true },
                                    { height: 10 },
                                    {
                                        cols: [
                                            {},
                                            {
                                                view: "button",
                                                value: "Create Account",
                                                css: "webix_primary",
                                                width: 160,
                                                click: async function () {
                                                    const form = $$("signupForm");
                                                    if (!form.validate()) return;

                                                    const btn = this;
                                                    btn.disable();
                                                    try {
                                                        const v = form.getValues();
                                                        await PreferencesAPI.signup({
                                                            username: v.username,
                                                            email: v.email,
                                                            password: v.password,
                                                        });
                                                        toastOk("Account created and signed in.");
                                                        $$("authWin").close();
                                                        onSuccess();
                                                    } catch (e) {
                                                        toastFail(e && e.message ? e.message : "Sign up failed.");
                                                    } finally {
                                                        btn.enable();
                                                    }
                                                },
                                            },
                                        ],
                                    },
                                ],
                                rules: {
                                    username: webix.rules.isNotEmpty,
                                    password: webix.rules.isNotEmpty,
                                },
                            },
                        },
                    ],
                },
            ],
        },
    });

    win.show();
}

async function loadPreferences() {
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
    } catch (e) {
        showError("Failed to load preferences. Please refresh and try again.");
    } finally {
        $$("root").hideProgress();
    }
}

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

    (async function init() {
        applyResponsive();

        if (!hasToken()) {
            openAuthWindow(async function () {
                await loadPreferences();
            });
            return;
        }

        await loadPreferences();
    })();
}
