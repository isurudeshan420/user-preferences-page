import { saveAll } from "../../actions.js";
import { resetSection } from "../../forms.js";

export function accountTab() {
    return {
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
    };
}
