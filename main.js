/* exported app */

const DICES = [
  "M12 12h.01z",
  "M16 16h.01zM8 8h.01z",
  "M12 12h.01zM16 16h.01zM8 8h.01z",
  "M16 8h.01zM16 16h.01zM8 8h.01zM8 16h.01z",
  "M12 12h.01zM16 8h.01zM16 16h.01zM8 8h.01zM8 16h.01z",
  "M16 8h.01zM16 12h.01zM16 16h.01zM8 8h.01zM8 12h.01zM8 16h.01z",
  "M12 12h.01zM16 8h.01zM16 12h.01zM16 16h.01zM8 8h.01zM8 12h.01zM8 16h.01z",
  "M16 8h.01zM16 12h.01zM16 16h.01zM8 8h.01zM8 12h.01zM8 16h.01zM12 10h.01zM12 14h.01z",
  "M12 12h.01zM16 8h.01zM16 12h.01zM16 16h.01zM8 8h.01zM8 12h.01zM8 16h.01zM12 16h.01zM12 8h.01z",
];

const HELP = [
  "Roll name (html, <h1> on plain text)",
  "Correct answer (html, <h2> on plain text)",
  "Incorrect answer (html, <h2> on plain text)",
  "Dices to roll (as XdY)",
  "Minimum score to obtain (0+)",
  "Saved roll expiration in minutes (0+, optional, default to 1 day)",
  "Roll button text (html, optional)",
];

let app = {
  data() {
    return {
      debug: true,
      debugData:
        "Gambling time\n<h2>Have a <a href='https://orteil.dashnet.org/cookieclicker/'>cookie</a> !</h2>\nYou fail !\n2d6\n6",
      readonly: false,
      header: "",
      successText: "",
      failureText: "",
      buttonText: "<i icon='dices'></i> Roll the dice",
      diceCount: 1,
      diceSides: 6,
      targetScore: 0,
      dices: [],
      rolling: false,
      expiration: 24 * 60,
      debugUrl: "",
      savedData: null,
      editor: {
        numbersCols: 0,
        numbersText: "",
        overlayText: "",
      },
    };
  },
  computed: {
    score() {
      return this.dices.reduce((s, v) => s + v, 0);
    },
    success() {
      return this.score >= this.targetScore;
    },
    alreadyRolled() {
      return !this.debug && this.savedData !== null;
    },
  },
  watch: {
    debugData(value) {
      this.readZData(value);
      this.updateEditor(value);
      this.updateDebugUrl(value);
    },
  },
  methods: {
    showApp() {
      document.getElementById("app").setAttribute("style", "");
    },
    updateDebugUrl(value) {
      this.debugUrl = value.trim().length
        ? window.location.pathname + "?z=" + this.encodeData(value.trim())
        : "";
    },
    updateEditor(value) {
      const debugDataSplit = value.split("\n");
      const lines = Array(Math.max(debugDataSplit.length, HELP.length)).fill(0);
      this.editor.numbersText = lines.map((v, i) => `${i + 1}.`).join("\n");
      this.editor.overlayText = lines
        .map((v, i) => {
          if (debugDataSplit.length > i && debugDataSplit[i].trim().length) {
            return " ".repeat(debugDataSplit[i].length);
          }
          if (HELP.length > i) {
            return HELP[i];
          }
          return "";
        })
        .join("\n");
      this.editor.numbersCols = (lines.length + 1).toString().length + 1;
    },
    roll() {
      this.rolling = true;
      setTimeout(() => {
        this.rolling = false;
        if (!this.debug) {
          this.readonly = true;
          const url = new URL(window.location);
          this.setCookie(url.searchParams.get("z"), this.dices.join(","), 1);
        }
      }, 1000);
    },
    updateDices() {
      this.dices = this.dices.map(() => this.randRange(1, this.diceSides + 1));
    },
    randRange(min, max) {
      return Math.floor(Math.random() * (max - min) + min);
    },
    base64URLTobase64(str) {
      const base64Encoded = str.replace(/-/g, "+").replace(/_/g, "/");
      const padding =
        str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
      return base64Encoded + padding;
    },
    base64tobase64URL(str) {
      return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    },
    decodeData(str) {
      return LZString.decompressFromBase64(
        this.base64URLTobase64(str.split("").reverse().join(""))
      );
    },
    encodeData(str) {
      return this.base64tobase64URL(LZString.compressToBase64(str))
        .split("")
        .reverse()
        .join("");
    },
    normalize(str) {
      return str
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    },
    getDiceSvg(value) {
      return DICES[Math.min(value, DICES.length) - 1];
    },
    readZData(str) {
      this.debugData = str;
      const parts = str.trim().split("\n");
      if (parts.length < 5) {
        return true;
      }
      this.header = parts.shift();
      if (!/<[^>]*>/.test(this.header)) {
        this.header = `<h1>${this.header}</h1>`;
      }
      this.successText = parts.shift();
      if (!/<[^>]*>/.test(this.successText)) {
        this.successText = `<h2>${this.successText}</h2>`;
      }
      this.failureText = parts.shift();
      if (!/<[^>]*>/.test(this.failureText)) {
        this.failureText = `<h2>${this.failureText}</h2>`;
      }
      const rawDice = parts.shift();
      if (!/^\d+d\d$/.test(rawDice)) {
        this.diceCount = 1;
        this.diceSides = 6;
      } else {
        this.diceCount = parseInt(rawDice.split("d")[0]);
        this.diceSides = parseInt(rawDice.split("d")[1]);
      }
      this.dices = new Array(this.diceCount).fill(this.diceSides);
      const rawTarget = parts.shift();
      if (!/^\d+$/.test(rawTarget)) {
        this.targetScore = 0;
      } else {
        this.targetScore = parseInt(rawTarget);
      }
      if (parts.length) {
        const rawExpiration = parts.shift();
        if (!/^\d+$/.test(rawExpiration)) {
          this.expiration = 24 * 60;
        } else {
          this.expiration = parseInt(rawExpiration);
        }
      }
      if (parts.length) {
        this.buttonText = parts.shift();
      }
      return false;
    },
    setCookie(cname, cvalue) {
      const d = new Date();
      d.setTime(d.getTime() + this.expiration * 60 * 1000);
      let expires = "expires=" + d.toUTCString();
      console.log(cname + "=" + cvalue + "; path=/; " + expires);
      document.cookie = cname + "=" + cvalue + "; path=/; " + expires;
    },
    getCookie(cname, defaultValue) {
      let name = cname + "=";
      let decodedCookie = decodeURIComponent(document.cookie);
      let ca = decodedCookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return defaultValue;
    },
    initApp() {
      const url = new URL(window.location);
      if (url.searchParams.get("z") !== null) {
        this.debug = this.readZData(this.decodeData(url.searchParams.get("z")));
        this.savedData = this.getCookie(url.searchParams.get("z"), null);
      }
      if (this.debug) {
        this.readZData(this.debugData);
        this.updateEditor(this.debugData);
        this.updateDebugUrl(this.debugData);
      }
      setTimeout(() => {
        if (this.alreadyRolled) {
          this.dices = this.savedData.split(",").map((v) => parseInt(v));
        }
      });
    },
    updateIcons() {
      lucide.createIcons({
        nameAttr: "icon",
        attrs: {
          width: "1.1em",
          height: "1.1em",
        },
      });
    },
  },
  beforeMount: function () {
    this.initApp();
  },
  mounted: function () {
    console.log("app mounted");
    setTimeout(this.showApp);
    setInterval(() => {
      if (this.rolling) {
        this.updateDices();
      }
    }, 50);
    this.updateIcons();
    this.$refs.code?.addEventListener("scroll", () => {
      this.$refs.numbers.scrollTop = this.$refs.code.scrollTop;
      this.$refs.overlay.scrollTop = this.$refs.code.scrollTop;
      this.$refs.overlay.scrollLeft = this.$refs.code.scrollLeft;
    });
  },
  updated: function () {
    this.updateIcons();
  },
};

window.onload = () => {
  app = Vue.createApp(app);
  app.mount("#app");
};
