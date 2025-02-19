// SAMPLE
this.manifest = {
  name: "Brum.js Chrome Extension —— Settings",
  icon: "icon.png",
  settings: [
    {
      tab: i18n.get("information"),
      group: i18n.get("login"),
      name: "username",
      type: "text",
      label: i18n.get("username"),
      text: i18n.get("x-characters"),
    },
    {
      tab: i18n.get("information"),
      group: i18n.get("login"),
      name: "password",
      type: "text",
      label: i18n.get("password"),
      text: i18n.get("x-characters-pw"),
      masked: true,
    },
    {
      tab: i18n.get("information"),
      group: i18n.get("login"),
      name: "myDescription",
      type: "description",
      text: i18n.get("description"),
    },

    {
      tab: "Feedback",
      group: "Overall Feedback",
      name: "likedBrumJs",
      type: "slider",
      label: "How much did you enjoy the relaunch of Brum.js?",
      max: 1,
      min: 0,
      step: 0.01,
      display: true,
      displayModifier: function (value) {
        return (value * 100).floor() + "%";
      },
    },
    {
      tab: "Feedback",
      group: "Overall Feedback",
      name: "likedStefansTalk",
      type: "slider",
      label: "How much did you enjoy Stefan's talk?",
      max: 100,
      min: 0,
      step: 1,
      display: true,
      displayModifier: function (value) {
        return value + "%";
      },
    },
    {
      tab: "Feedback",
      group: "Banter?",
      name: "jokesPopup",
      type: "popupButton",
      label: `Stefan's "jokes" in this talk were...`,
      options: {
        groups: ["👍", "👎"],
        values: [
          {
            group: "👍",
            value: "Really good",
          },
          {
            group: "👍",
            value: "Super funny",
          },
          {
            group: "👍",
            value: "Absolutely hillarious",
          },
          {
            group: "👎",
            value: "Bloody F- Terrible",
          },
        ],
      },
    },
    {
      tab: "Feedback",
      group: "Banter?",
      name: "explainSpeedPopup",
      type: "popupButton",
      label: `The way he explained things was...`,
      options: {
        values: [
          {
            value: "Waaaay too fast",
          },
          {
            value: "Just right",
          },
          {
            value: "Waaaay too slow",
          },
        ],
      },
    },
  ],
  alignment: [
    ["username", "password"],
    ["likedBrumJs", "likedStefansTalk"],
    ["jokesPopup", "explainSpeedPopup"],
  ],
};
