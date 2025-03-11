import { createApp } from "vue";

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
  "Success message (html, <h2> on plain text)",
  "Failure message (html, <h2> on plain text)",
  "Dices to roll (as XdY)",
  "Minimum score to obtain (0+)",
  "Saved roll expiration in minutes (0+, optional, default to 1440 minutes)",
  "Roll button text (html, optional)",
];
const DEFAULT_VALUES = {
  header: "",
  successText: "",
  failureText: "",
  diceCount: 1,
  diceSides: 6,
  targetScore: 0,
  expiration: 24 * 60,
  buttonText: "<i icon='dices'></i> Roll the dice",
};

const utils = {
  base64URLTobase64(str) {
    const base64Encoded = str.replace(/-/gu, "+").replace(/_/gu, "/");
    const padding =
      str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
    return base64Encoded + padding;
  },
  base64tobase64URL(str) {
    return str.replace(/\+/gu, "-").replace(/\//gu, "_").replace(/[=]+$/u, "");
  },
  decodeData(str) {
    return LZString.decompressFromBase64(
      utils.base64URLTobase64(str.split("").reverse().join(""))
    );
  },
  encodeData(str) {
    return utils
      .base64tobase64URL(LZString.compressToBase64(str))
      .split("")
      .reverse()
      .join("");
  },
  clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },
  setCookie(cname, cvalue, minutes) {
    const date = new Date();
    date.setTime(date.getTime() + minutes * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${cname}=${cvalue}; path=/; ${expires}`;
  },
  getCookie(cname, defaultValue) {
    const name = `${cname}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(";");
    for (let index = 0; index < cookies.length; index += 1) {
      let cookie = cookies[index];
      while (cookie.charAt(0) === " ") {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return defaultValue;
  },
  randRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  },
};

const app = createApp({
  data() {
    return {
      debug: true,
      debugData:
        "Gambling time\n<h2>Have a <a href='https://orteil.dashnet.org/cookieclicker/'>cookie</a> !</h2>\nYou fail !\n2d6\n6",
      debugUrl: "",
      editor: {
        numbersCols: 0,
        numbersText: "",
        overlayText: "",
      },
      parsed: DEFAULT_VALUES,
      readonly: false,
      dices: [],
      rolling: false,
      savedData: null,
    };
  },
  computed: {
    score() {
      return this.dices.reduce((sum, value) => sum + value, 0);
    },
    success() {
      return this.score >= this.parsed.targetScore;
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
  beforeMount() {
    this.initApp();
  },
  mounted() {
    setTimeout(this.showApp);
    setInterval(() => {
      if (this.rolling) {
        this.updateDices();
      }
    }, 50);
    this.updateIcons();
  },
  updated() {
    this.updateIcons();
  },
  methods: {
    showApp() {
      document.getElementById("app").setAttribute("style", "");
    },
    initApp() {
      const url = new URL(window.location);
      if (url.searchParams.get("z") !== null) {
        this.debug = this.readZData(
          utils.decodeData(url.searchParams.get("z"))
        );
        this.savedData = utils.getCookie(url.searchParams.get("z"), null);
      }
      if (this.debug) {
        this.readZData(this.debugData);
        this.updateEditor(this.debugData);
        this.updateDebugUrl(this.debugData);
      }
      setTimeout(() => {
        if (this.alreadyRolled) {
          this.dices = this.savedData
            .split(",")
            .map((value) => parseInt(value, 10));
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
    updateDebugUrl(value) {
      this.debugUrl = value.trim().length
        ? `${window.location.pathname}?z=${utils.encodeData(value.trim())}`
        : "";
    },
    updateEditor(value) {
      const debugDataSplit = value.split("\n");
      const lines = Array(Math.max(debugDataSplit.length, HELP.length)).fill(0);
      this.editor.numbersText = debugDataSplit
        .map((_value, index) => `${index + 1}.`)
        .join("\n");
      this.editor.overlayText = lines
        .map((_value, index) => {
          if (
            debugDataSplit.length > index &&
            debugDataSplit[index].trim().length
          ) {
            return " ".repeat(debugDataSplit[index].length);
          }
          if (HELP.length > index) {
            return HELP[index];
          }
          return "";
        })
        .join("\n");
      this.editor.numbersCols = lines.length.toString().length + 1;
    },
    editorScroll() {
      this.$refs.numbers.scrollTop = this.$refs.code.scrollTop;
      this.$refs.overlay.scrollTop = this.$refs.code.scrollTop;
      this.$refs.overlay.scrollLeft = this.$refs.code.scrollLeft;
    },
    readZData(str) {
      this.debugData = str;
      this.parsed = utils.clone(DEFAULT_VALUES);
      const parts = str.split("\n");
      if (parts.length < 5) {
        return true;
      }
      this.parsed.header = parts.shift();
      if (!/<[^>]*>/u.test(this.parsed.header)) {
        this.parsed.header = `<h1>${this.parsed.header}</h1>`;
      }
      this.parsed.successText = parts.shift();
      if (!/<[^>]*>/u.test(this.parsed.successText)) {
        this.parsed.successText = `<h2>${this.parsed.successText}</h2>`;
      }
      this.parsed.failureText = parts.shift();
      if (!/<[^>]*>/u.test(this.parsed.failureText)) {
        this.parsed.failureText = `<h2>${this.parsed.failureText}</h2>`;
      }
      const rawDice = parts.shift();
      if (/^\d+d\d$/u.test(rawDice)) {
        this.parsed.diceCount = parseInt(rawDice.split("d")[0], 10);
        this.parsed.diceSides = parseInt(rawDice.split("d")[1], 10);
      }
      this.dices = Array(this.parsed.diceCount).fill(this.parsed.diceSides);
      const rawTarget = parts.shift();
      if (/^\d+$/u.test(rawTarget)) {
        this.parsed.targetScore = parseInt(rawTarget, 10);
      }
      if (parts.length) {
        const rawExpiration = parts.shift();
        if (!/^\d+$/u.test(rawExpiration)) {
          this.parsed.expiration = parseInt(rawExpiration, 10);
        }
      }
      if (parts.length) {
        this.parsed.buttonText = parts.shift();
      }
      return false;
    },
    roll() {
      this.rolling = true;
      setTimeout(() => {
        this.rolling = false;
        if (!this.debug) {
          this.readonly = true;
          const url = new URL(window.location);
          if (this.parsed.expiration) {
            utils.setCookie(
              url.searchParams.get("z"),
              this.dices.join(","),
              this.parsed.expiration
            );
          }
        }
      }, 1000);
    },
    updateDices() {
      this.dices = this.dices.map(() =>
        utils.randRange(1, this.parsed.diceSides + 1)
      );
    },
    getDiceSvg(value) {
      return DICES[Math.min(value, DICES.length) - 1];
    },
  },
});

window.onload = () => {
  app.mount("#app");
};
