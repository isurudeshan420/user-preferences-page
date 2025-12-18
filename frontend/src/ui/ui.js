import { saveAll } from "../actions.js";

import { accountTab } from "./tabs/accountTab.js";
import { notificationsTab } from "./tabs/notificationsTab.js";
import { themeTab } from "./tabs/themeTab.js";
import { privacyTab } from "./tabs/privacyTab.js";

export const categoryData = [
    { id: "account", value: "Account Settings" },
    { id: "notifications", value: "Notification Settings" },
    { id: "theme", value: "Theme Settings" },
    { id: "privacy", value: "Privacy Settings" },
];

export function buildMenuPopup() {
    return webix.ui({
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
}

export function buildLayout() {
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
                            return (
                                '<span class="' +
                                cls +
                                '">' +
                                webix.template.escape(obj.text) +
                                "</span>"
                            );
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
                            accountTab(),

                            // ------------------- NOTIFICATIONS -------------------
                            notificationsTab(),

                            // ------------------- THEME -------------------
                            themeTab(),

                            // ------------------- PRIVACY -------------------
                            privacyTab(),
                        ],
                    },
                ],
            },
        ],
    });
}
