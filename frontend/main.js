webix.ready(function () {
  // ---------- state ----------
  let loadedPreferences = null;
  let dirty = false;
  const dirtySections = new Set();

  function setDirty(sectionId, isDirty) {
    if (isDirty) dirtySections.add(sectionId);
    else dirtySections.delete(sectionId);

    dirty = dirtySections.size > 0;

    const status = $$("statusLabel");
    if (status) {
      status.setValues({
        text: dirty ? "Unsaved changes" : "All changes saved",
        dirty: dirty,
      });
      status.refresh();
    }

    const saveAll = $$("saveAllBtn");
    if (saveAll) saveAll.define("disabled", !dirty);
    if (saveAll) saveAll.refresh();
  }

  function showError(message) {
    const banner = $$("errorBanner");
    banner.setHTML('<div class="error-banner">' + webix.template.escape(message) + "</div>");
    banner.show();
  }

  function clearError() {
    const banner = $$("errorBanner");
    banner.hide();
    banner.setHTML("");
  }

  function toastOk(msg) {
    webix.message({ type: "success", text: msg, expire: 2500 });
  }

  function toastFail(msg) {
    webix.message({ type: "error", text: msg, expire: 3500 });
  }

  function currentSectionId() {
    return $$("views").getValue();
  }

  // ---------- helpers ----------
  function bindDirtyTracking(sectionId, formId) {
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

  function buildPayloadFromForms() {
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
      meta: loadedPreferences && loadedPreferences.meta ? loadedPreferences.meta : { updatedAt: null },
    };

    return { preferences: preferences, passwordUpdate: passwordUpdate };
  }

  function validateAll() {
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

  async function saveAll() {
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
      loadedPreferences = res.saved;

      // Clear password fields after successful save
      $$("form_password").setValues(
          { currentPassword: "", newPassword: "", confirmPassword: "" },
          true
      );

      dirtySections.clear();
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
      btn.define("disabled", !dirty);
      btn.refresh();
    }
  }

  function resetSection(sectionId) {
    if (!loadedPreferences) return;

    if (sectionId === "account") {
      $$("form_account").setValues(loadedPreferences.account, true);
      $$("form_password").setValues({ currentPassword: "", newPassword: "", confirmPassword: "" }, true);
    }

    if (sectionId === "notifications") {
      $$("form_notifications").setValues(loadedPreferences.notifications, true);
    }

    if (sectionId === "theme") {
      $$("form_theme").setValues(loadedPreferences.theme, true);
    }

    if (sectionId === "privacy") {
      $$("form_privacy").setValues(loadedPreferences.privacy, true);
    }

    setDirty(sectionId, false);
    clearError();
    toastOk("Changes reverted.");
  }

  // ---------- UI ----------
  const categoryData = [
    { id: "account", value: "Account Settings" },
    { id: "notifications", value: "Notification Settings" },
    { id: "theme", value: "Theme Settings" },
    { id: "privacy", value: "Privacy Settings" },
  ];

  const menuPopup = webix.ui({
    view: "popup",
    id: "categoryPopup",
    width: 260,
    body: {
      view: "list",
      id: "categoryPopupList",
      select: true,
      scroll: false,
      data: categoryData,
      on: {
        onAfterSelect: function (id) {
          $$("views").setValue(id);
          $$("categoryList").select(id);
          $$("categoryPopup").hide();
        },
      },
    },
  });

  webix.ui({
    container: "app",
    id: "root",
    rows: [
      {
        view: "toolbar",
        padding: { left: 12, right: 12 },
        elements: [
          {
            view: "button",
            id: "menuBtn",
            type: "icon",
            icon: "wxi-menu",
            width: 44,
            hidden: true,
            click: function () {
              $$("categoryPopup").show(this.getNode());
            },
          },
          { view: "label", label: "User Preferences" },
          {},
          {
            view: "template",
            id: "statusLabel",
            borderless: true,
            width: 170,
            data: { text: "All changes saved", dirty: false },
            template: function (obj) {
              const cls = obj.dirty ? "status-pill dirty" : "status-pill";
              return '<span class="' + cls + '">' + webix.template.escape(obj.text) + "</span>";
            },
          },
          {
            view: "button",
            id: "saveAllBtn",
            value: "Save All",
            css: "webix_primary",
            width: 120,
            disabled: true,
            click: saveAll,
          },
        ],
      },
      {
        view: "template",
        id: "errorBanner",
        hidden: true,
        borderless: true,
        height: 0,
        autoheight: true,
        template: "",
      },
      {
        cols: [
          {
            view: "list",
            id: "categoryList",
            width: 240,
            css: "side-nav",
            select: true,
            scroll: false,
            data: categoryData,
            on: {
              onAfterSelect: function (id) {
                $$("views").setValue(id);
              },
            },
          },
          {
            view: "multiview",
            id: "views",
            keepViews: true,
            cells: [
              // ------------------- ACCOUNT -------------------
              {
                id: "account",
                view: "scrollview",
                scroll: "y",
                body: {
                  rows: [
                    { template: "Account Settings", type: "header" },

                    {
                      template:
                          '<div class="muted-hint">Update username and email. Use the Password section to manage password changes.</div>',
                      borderless: true,
                      height: 52,
                    },

                    {
                      view: "form",
                      id: "form_account",
                      css: "section-card",
                      padding: 14,
                      elementsConfig: { labelPosition: "top" },
                      elements: [
                        {
                          view: "text",
                          name: "username",
                          label: "Username",
                          required: true,
                          invalidMessage: "Username must be at least 3 characters.",
                          attributes: { "aria-label": "Username" },
                        },
                        {
                          view: "text",
                          name: "email",
                          label: "Email",
                          required: true,
                          invalidMessage: "Enter a valid email address.",
                          attributes: { "aria-label": "Email" },
                        },
                      ],
                      rules: {
                        username: Validators.minLen(3),
                        email: webix.rules.isEmail,
                      },
                    },

                    { height: 12, borderless: true },

                    {
                      template: '<div class="section-title">Password Management</div>',
                      borderless: true,
                      height: 28,
                    },

                    {
                      view: "form",
                      id: "form_password",
                      css: "section-card",
                      padding: 14,
                      elementsConfig: { labelPosition: "top" },
                      elements: [
                        {
                          view: "text",
                          type: "password",
                          name: "currentPassword",
                          label: "Current password",
                          placeholder: "Enter current password",
                          attributes: { "aria-label": "Current password" },
                        },
                        {
                          view: "text",
                          type: "password",
                          name: "newPassword",
                          label: "New password",
                          placeholder: "Minimum 8 chars, uppercase/lowercase/digit",
                          invalidMessage:
                              "Password must be at least 8 chars and include uppercase, lowercase, and a digit.",
                          attributes: { "aria-label": "New password" },
                        },
                        {
                          view: "text",
                          type: "password",
                          name: "confirmPassword",
                          label: "Confirm new password",
                          invalidMessage: "Must match the new password.",
                          attributes: { "aria-label": "Confirm new password" },
                        },
                        {
                          template:
                              '<div class="muted-hint">Note: Password values are not stored locally. In a real backend integration, password changes are handled securely by the server.</div>',
                          borderless: true,
                          height: 56,
                        },
                      ],
                      rules: {
                        // Password change optional. Only validate if newPassword is provided.
                        newPassword: function (value) {
                          if (!value || !String(value).trim()) return true;
                          return Validators.strongPassword(value);
                        },
                        confirmPassword: function (value) {
                          const v = this.getValues();
                          if (!v.newPassword || !String(v.newPassword).trim()) return true;
                          return value === v.newPassword;
                        },
                        currentPassword: function (value) {
                          const v = this.getValues();
                          if (!v.newPassword || !String(v.newPassword).trim()) return true;
                          return Validators.isNonEmptyString(value);
                        },
                      },
                    },

                    { height: 12, borderless: true },

                    {
                      cols: [
                        {},
                        {
                          view: "button",
                          value: "Reset",
                          width: 120,
                          click: function () {
                            resetSection("account");
                          },
                        },
                        { width: 10 },
                        {
                          view: "button",
                          value: "Save",
                          css: "webix_primary",
                          width: 120,
                          click: saveAll,
                        },
                      ],
                    },

                    { height: 18, borderless: true },
                  ],
                },
              },

              // ------------------- NOTIFICATIONS -------------------
              {
                id: "notifications",
                view: "scrollview",
                scroll: "y",
                body: {
                  rows: [
                    { template: "Notification Settings", type: "header" },

                    {
                      template:
                          '<div class="muted-hint">Choose which channels you want and how frequently you receive notifications.</div>',
                      borderless: true,
                      height: 52,
                    },

                    {
                      view: "form",
                      id: "form_notifications",
                      css: "section-card",
                      padding: 14,
                      elementsConfig: { labelPosition: "top" },
                      elements: [
                        {
                          view: "switch",
                          name: "emailEnabled",
                          label: "Email notifications",
                          onLabel: "On",
                          offLabel: "Off",
                          attributes: { "aria-label": "Email notifications" },
                        },
                        {
                          view: "switch",
                          name: "pushEnabled",
                          label: "Push notifications",
                          onLabel: "On",
                          offLabel: "Off",
                          attributes: { "aria-label": "Push notifications" },
                        },
                        {
                          view: "combo",
                          name: "frequency",
                          label: "Notification frequency",
                          options: [
                            { id: "instant", value: "Instant" },
                            { id: "daily", value: "Daily" },
                            { id: "weekly", value: "Weekly" },
                          ],
                          required: true,
                          invalidMessage: "Choose a frequency.",
                          attributes: { "aria-label": "Notification frequency" },
                        },
                        {
                          margin: 10,
                          cols: [
                            {
                              view: "checkbox",
                              name: "productUpdates",
                              labelRight: "Product updates",
                              labelWidth: 0,
                              attributes: { "aria-label": "Product updates" },
                            },
                            {
                              view: "checkbox",
                              name: "marketingEmails",
                              labelRight: "Marketing emails",
                              labelWidth: 0,
                              attributes: { "aria-label": "Marketing emails" },
                            },
                          ],
                        },
                      ],
                      rules: {
                        frequency: function (value) {
                          // If all notifications are disabled, frequency can be anything.
                          const v = this.getValues();
                          if (!v.emailEnabled && !v.pushEnabled) return true;
                          return Validators.isNonEmptyString(value);
                        },
                      },
                    },

                    { height: 12, borderless: true },

                    {
                      cols: [
                        {},
                        {
                          view: "button",
                          value: "Reset",
                          width: 120,
                          click: function () {
                            resetSection("notifications");
                          },
                        },
                        { width: 10 },
                        {
                          view: "button",
                          value: "Save",
                          css: "webix_primary",
                          width: 120,
                          click: saveAll,
                        },
                      ],
                    },

                    { height: 18, borderless: true },
                  ],
                },
              },

              // ------------------- THEME -------------------
              {
                id: "theme",
                view: "scrollview",
                scroll: "y",
                body: {
                  rows: [
                    { template: "Theme Settings", type: "header" },

                    {
                      template:
                          '<div class="muted-hint">Customize appearance. Primary color expects a HEX value (#RRGGBB).</div>',
                      borderless: true,
                      height: 52,
                    },

                    {
                      view: "form",
                      id: "form_theme",
                      css: "section-card",
                      padding: 14,
                      elementsConfig: { labelPosition: "top" },
                      elements: [
                        {
                          view: "segmented",
                          name: "mode",
                          label: "Theme mode",
                          options: [
                            { id: "system", value: "System" },
                            { id: "light", value: "Light" },
                            { id: "dark", value: "Dark" },
                          ],
                          attributes: { "aria-label": "Theme mode" },
                        },
                        {
                          view: "text",
                          name: "primaryColor",
                          label: "Primary color",
                          placeholder: "#4f46e5",
                          required: true,
                          invalidMessage: "Enter a valid HEX color, e.g., #4f46e5",
                          attributes: { "aria-label": "Primary color" },
                        },
                        {
                          view: "combo",
                          name: "fontSize",
                          label: "Font size",
                          options: [
                            { id: "small", value: "Small" },
                            { id: "medium", value: "Medium" },
                            { id: "large", value: "Large" },
                          ],
                          required: true,
                          invalidMessage: "Choose a font size.",
                          attributes: { "aria-label": "Font size" },
                        },
                        {
                          view: "combo",
                          name: "density",
                          label: "Layout density",
                          options: [
                            { id: "comfortable", value: "Comfortable" },
                            { id: "compact", value: "Compact" },
                          ],
                          required: true,
                          invalidMessage: "Choose a density.",
                          attributes: { "aria-label": "Layout density" },
                        },
                      ],
                      rules: {
                        primaryColor: Validators.isHexColor,
                        fontSize: Validators.isNonEmptyString,
                        density: Validators.isNonEmptyString,
                      },
                    },

                    { height: 12, borderless: true },

                    {
                      cols: [
                        {},
                        {
                          view: "button",
                          value: "Reset",
                          width: 120,
                          click: function () {
                            resetSection("theme");
                          },
                        },
                        { width: 10 },
                        {
                          view: "button",
                          value: "Save",
                          css: "webix_primary",
                          width: 120,
                          click: saveAll,
                        },
                      ],
                    },

                    { height: 18, borderless: true },
                  ],
                },
              },

              // ------------------- PRIVACY -------------------
              {
                id: "privacy",
                view: "scrollview",
                scroll: "y",
                body: {
                  rows: [
                    { template: "Privacy Settings", type: "header" },

                    {
                      template:
                          '<div class="muted-hint">Control visibility and what data you allow to be shared.</div>',
                      borderless: true,
                      height: 52,
                    },

                    {
                      view: "form",
                      id: "form_privacy",
                      css: "section-card",
                      padding: 14,
                      elementsConfig: { labelPosition: "top" },
                      elements: [
                        {
                          view: "radio",
                          name: "profileVisibility",
                          label: "Profile visibility",
                          options: [
                            { id: "public", value: "Public" },
                            { id: "contacts", value: "Contacts only" },
                            { id: "private", value: "Private" },
                          ],
                          required: true,
                          invalidMessage: "Choose a visibility setting.",
                          attributes: { "aria-label": "Profile visibility" },
                        },
                        {
                          view: "checkbox",
                          name: "dataSharingAnalytics",
                          labelRight: "Allow analytics data sharing",
                          labelWidth: 0,
                          attributes: { "aria-label": "Analytics data sharing" },
                        },
                        {
                          view: "checkbox",
                          name: "dataSharingPersonalization",
                          labelRight: "Allow personalization data sharing",
                          labelWidth: 0,
                          attributes: { "aria-label": "Personalization data sharing" },
                        },
                      ],
                      rules: {
                        profileVisibility: Validators.isNonEmptyString,
                      },
                    },

                    { height: 12, borderless: true },

                    {
                      cols: [
                        {},
                        {
                          view: "button",
                          value: "Reset",
                          width: 120,
                          click: function () {
                            resetSection("privacy");
                          },
                        },
                        { width: 10 },
                        {
                          view: "button",
                          value: "Save",
                          css: "webix_primary",
                          width: 120,
                          click: saveAll,
                        },
                      ],
                    },

                    { height: 18, borderless: true },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  });

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

      loadedPreferences = await PreferencesAPI.getPreferences();

      $$("form_account").setValues(loadedPreferences.account, true);
      $$("form_notifications").setValues(loadedPreferences.notifications, true);
      $$("form_theme").setValues(loadedPreferences.theme, true);
      $$("form_privacy").setValues(loadedPreferences.privacy, true);
      $$("form_password").setValues({ currentPassword: "", newPassword: "", confirmPassword: "" }, true);

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
});
