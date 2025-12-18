import { saveAll } from "../../actions.js";
import { resetSection } from "../../forms.js";

export function notificationsTab() {
    return {
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
    };
}
