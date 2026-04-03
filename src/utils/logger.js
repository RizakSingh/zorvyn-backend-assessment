const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const CURRENT_LEVEL = process.env.NODE_ENV === "production" ? "info" : "debug";

const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
};

const logger = {
  error: (msg) => console.error(formatMessage("error", msg)),
  warn: (msg) => console.warn(formatMessage("warn", msg)),
  info: (msg) => {
    if (LOG_LEVELS[CURRENT_LEVEL] >= LOG_LEVELS.info) {
      console.log(formatMessage("info", msg));
    }
  },
  debug: (msg) => {
    if (LOG_LEVELS[CURRENT_LEVEL] >= LOG_LEVELS.debug) {
      console.log(formatMessage("debug", msg));
    }
  },
};

module.exports = logger;
