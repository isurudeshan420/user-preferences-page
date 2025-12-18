const Validators = require("../../src/utils/validators.js");

test("strongPassword accepts valid password", () => {
    expect(Validators.strongPassword("Abcdefg1")).toBe(true);
});

test("strongPassword rejects weak password", () => {
    expect(Validators.strongPassword("abcdefg1")).toBe(false);
    expect(Validators.strongPassword("ABCDEFG1")).toBe(false);
    expect(Validators.strongPassword("Abcdefgh")).toBe(false);
    expect(Validators.strongPassword("Abc1")).toBe(false);
});

test("isHexColor validates #RRGGBB", () => {
    expect(Validators.isHexColor("#4f46e5")).toBe(true);
    expect(Validators.isHexColor("#4F46E5")).toBe(true);
    expect(Validators.isHexColor("4f46e5")).toBe(false);
    expect(Validators.isHexColor("#zzz000")).toBe(false);
});
