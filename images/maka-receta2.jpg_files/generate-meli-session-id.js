const PLUGIN_VERSION = "0.1.0"; // Update with the current version
const IS_DEV = false; // Change to true if you are in development mode

const SECURITY_SCRIPT_URL = "https://www.mercadopago.com/v2/security.js";
const MERCADOPAGO_MONITOR_URL =
  "https://api.mercadopago.com/ppcore/prod/monitor";
const WINDOW_VARIABLE_NAME = "MP_DEVICE_SESSION_ID";
const LOADING_SCRIPT_VALUE = "LOADING_SCRIPT";
const SUCCESS_METRIC_VALUE = "SUCCESS_LOADED_SCRIPT";
const LOAD_SCRIPT_ERROR = "LOAD_SCRIPT_ERROR";
const INSERT_SCRIPT_ERROR = "INSERT_SCRIPT_ERROR";
const MELI_SESSION_ID_KEY = "meli_session_id";
const PLATFORM_NAME = "shopify";
const LOAD_SCRIPT_METRIC_NAME = IS_DEV
  ? "load_embed_block_test"
  : "load_embed_block";

const registerDatadogEvent = (eventName, value, message = "") => {
  try {
    // eslint-disable-next-line no-undef
    const shopUrl = Shopify?.shop;

    if (!shopUrl) return;

    const payload = {
      value,
      message,
      plugin_version: PLUGIN_VERSION,
      platform: {
        name: PLATFORM_NAME,
        version: "",
        uri: "",
        url: shopUrl,
      },
    };

    navigator.sendBeacon(
      `${MERCADOPAGO_MONITOR_URL}/v1/event/datadog/smb/${eventName}`,
      JSON.stringify(payload),
    );
  } catch (err) {}
};

function createScriptTag() {
  const script = document.createElement("script");
  script.src = SECURITY_SCRIPT_URL;
  script.defer = true;

  script.onerror = () =>
    registerDatadogEvent(LOAD_SCRIPT_METRIC_NAME, LOAD_SCRIPT_ERROR);

  script.onload = () => {
    Object.defineProperty(window, WINDOW_VARIABLE_NAME, {
      set: (value) => {
        if (value && value.includes("armor")) {
          registerDatadogEvent(LOAD_SCRIPT_METRIC_NAME, SUCCESS_METRIC_VALUE);
          window.sessionStorage.setItem(MELI_SESSION_ID_KEY, value);
        }
      },
    });
  };

  return script;
}

(() => {
  try {
    registerDatadogEvent(LOAD_SCRIPT_METRIC_NAME, LOADING_SCRIPT_VALUE);
    const scriptTag = createScriptTag();
    document.head.appendChild(scriptTag);
  } catch (e) {
    registerDatadogEvent(
      LOAD_SCRIPT_METRIC_NAME,
      INSERT_SCRIPT_ERROR,
      e?.message || e?.toString(),
    );
  }
})();
