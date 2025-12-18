import { saveAll } from "../../actions.js";
import { resetSection } from "../../forms.js";

export function privacyTab() {
    return {
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
    };
}
