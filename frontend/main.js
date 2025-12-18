
webix.ready(function () {
  webix.ui({
    container: "app",
    id: "root",
    rows: [
      {
        view: "toolbar",
        padding: { left: 16, right: 16 },
        elements: [
          { view: "label", label: "User Preferences" },
          {},
          {
            view: "button",
            value: "Save All",
            css: "webix_primary",
            width: 120,
            click: function () {
              webix.message("TODO: Wire this to backend save");
            },
          },
        ],
      },
      {
        cols: [
          {
            view: "list",
            id: "categoryList",
            width: 220,
            css: "side-nav",
            select: true,
            scroll: false,
            data: [
              { id: "account", value: "Account Settings" },
              { id: "notifications", value: "Notification Settings" },
              { id: "theme", value: "Theme Settings" },
              { id: "privacy", value: "Privacy Settings" },
            ],
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
              {
                id: "account",
                rows: [
                  { template: "Account Settings", type: "header" },
                  { template: "TODO: build Account Settings form", autoheight: true },
                  { template: "TODO: build Account Settings form", autoheight: true },
                  { template: "TODO: build Account Settings form", autoheight: true },
                  { template: "TODO: build Account Settings form", autoheight: true },
                  { template: "TODO: build Account Settings form", autoheight: true },
                  { template: "TODO: build Account Settings form", autoheight: true },
                  { template: "TODO: build Account Settings form", autoheight: true },
                  { template: "TODO: build Account Settings form", autoheight: true },
                  { template: "TODO: build Account Settings form", autoheight: true },
                  { template: "TODO: build Account Settings form", autoheight: true },
                  { template: "TODO: build Account Settings form", autoheight: true },
                  { template: "TODO: build Account Settings form", autoheight: true }
                ],
              },
              {
                id: "notifications",
                rows: [
                  { template: "Notification Settings", type: "header" },
                  { template: "TODO: build Notification Settings form", autoheight: true },
                ],
              },
              {
                id: "theme",
                rows: [
                  { template: "Theme Settings", type: "header" },
                  { template: "TODO: build Theme Settings form", autoheight: true },
                ],
              },
              {
                id: "privacy",
                rows: [
                  { template: "Privacy Settings", type: "header" },
                  { template: "TODO: build Privacy Settings form", autoheight: true },
                ],
              },
            ],
          },
        ],
      },
    ],
  });


  $$("categoryList").select("account");
});


