import { saveAll } from "../../actions.js";
import { resetSection } from "../../forms.js";

export function themeTab() {
    return {
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
    };
}
