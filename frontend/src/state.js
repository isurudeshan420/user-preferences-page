// ---------- state ----------
export const state = {
    loadedPreferences: null,
    dirty: false,
    dirtySections: new Set(),
};

export function currentSectionId() {
    return $$("views").getValue();
}

export function setDirty(sectionId, isDirty) {
    if (isDirty) state.dirtySections.add(sectionId);
    else state.dirtySections.delete(sectionId);

    state.dirty = state.dirtySections.size > 0;

    const status = $$("statusLabel");
    if (status) {
        status.setValues({
            text: state.dirty ? "Unsaved changes" : "All changes saved",
            dirty: state.dirty,
        });
        status.refresh();
    }

    const saveAll = $$("saveAllBtn");
    if (saveAll) saveAll.define("disabled", !state.dirty);
    if (saveAll) saveAll.refresh();
}
