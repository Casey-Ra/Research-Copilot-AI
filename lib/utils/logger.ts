type LogLevel = "error" | "warn" | "info" | "debug";

const levelOrder: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const configuredLevel: LogLevel = (() => {
  const configured = process.env.APP_LOG_LEVEL?.toLowerCase();

  if (configured === "error" || configured === "warn" || configured === "info" || configured === "debug") {
    return configured;
  }

  return process.env.NODE_ENV === "production" ? "info" : "debug";
})();

function shouldLog(level: LogLevel) {
  return levelOrder[level] <= levelOrder[configuredLevel];
}

function formatContext(context?: Record<string, unknown>) {
  if (!context) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => {
      if (typeof value === "string" && value.length > 180) {
        return [key, `${value.slice(0, 177)}...`];
      }

      return [key, value];
    }),
  );
}

function emit(level: LogLevel, event: string, context?: Record<string, unknown>) {
  if (!shouldLog(level)) {
    return;
  }

  // Keep hooks lightweight and avoid logging raw document contents or secrets.
  const payload = formatContext(context);
  const prefix = `[ResearchCopilot][${level.toUpperCase()}] ${event}`;

  if (level === "error") {
    console.error(prefix, payload);
    return;
  }

  if (level === "warn") {
    console.warn(prefix, payload);
    return;
  }

  console.log(prefix, payload);
}

export const logger = {
  error(event: string, context?: Record<string, unknown>) {
    emit("error", event, context);
  },
  warn(event: string, context?: Record<string, unknown>) {
    emit("warn", event, context);
  },
  info(event: string, context?: Record<string, unknown>) {
    emit("info", event, context);
  },
  debug(event: string, context?: Record<string, unknown>) {
    emit("debug", event, context);
  },
};
