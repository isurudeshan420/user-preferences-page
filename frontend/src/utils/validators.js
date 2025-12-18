(function (root, factory) {
    if (typeof module === "object" && module.exports) module.exports = factory();
    else root.Validators = factory();
})(typeof self !== "undefined" ? self : this, function () {
    function isNonEmptyString(v) {
        return typeof v === "string" && v.trim().length > 0;
    }

    function minLen(n) {
        return function (v) {
            return typeof v === "string" && v.trim().length >= n;
        };
    }

    function strongPassword(v) {
        if (typeof v !== "string") return false;
        // >= 8 chars, at least 1 lowercase, 1 uppercase, 1 digit
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v);
    }

    function isHexColor(v) {
        if (typeof v !== "string") return false;
        return /^#([0-9a-fA-F]{6})$/.test(v.trim());
    }

    return {
        isNonEmptyString,
        minLen,
        strongPassword,
        isHexColor,
    };
});
