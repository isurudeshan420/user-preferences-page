export function showError(message) {
    const banner = $$("errorBanner");
    banner.setHTML(
        '<div class="error-banner">' + webix.template.escape(message) + "</div>"
    );
    banner.show();
}

export function clearError() {
    const banner = $$("errorBanner");
    banner.hide();
    banner.setHTML("");
}

export function toastOk(msg) {
    webix.message({ type: "success", text: msg, expire: 2500 });
}

export function toastFail(msg) {
    webix.message({ type: "error", text: msg, expire: 3500 });
}
