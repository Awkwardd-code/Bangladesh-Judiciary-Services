const isProduction = process.env.NODE_ENV === "production";

function formatMeta(meta?: Record<string, unknown>): string {
  if (!meta) {
    return "";
  }

  if (isProduction) {
    return ` ${JSON.stringify(meta)}`;
  }

  return ` ${Object.entries(meta)
    .map(([key, value]) => {
      const rendered =
        typeof value === "string" ? value : JSON.stringify(value, null, 2);
      return `${key}=${rendered}`;
    })
    .join(" ")}`;
}

export const logger = {
  info: (msg: string, meta?: Record<string, unknown>) => {
    const stamp = new Date().toISOString();
    const text = `${stamp} [INFO] ${msg}${formatMeta(meta)}`;
    console.log(text);
  },
  warn: (msg: string, meta?: Record<string, unknown>) => {
    const stamp = new Date().toISOString();
    const text = `${stamp} [WARN] ${msg}${formatMeta(meta)}`;
    console.warn(text);
  },
  error: (msg: string, meta?: Record<string, unknown>) => {
    const stamp = new Date().toISOString();
    const text = `${stamp} [ERROR] ${msg}${formatMeta(meta)}`;
    console.error(text);
  },
};

// NOTE: replace ad-hoc console.error calls in API routes with
// logger.error over time. Do NOT rewrite every route in this pass.
