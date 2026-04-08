export const nowIso = () => new Date().toISOString();

export const ok = <T>(data: T, message = "OK") => ({
  success: true,
  data,
  message,
  timestamp: nowIso()
});

export const fail = (code: string, message: string, details?: unknown) => ({
  success: false,
  error: { code, message, details },
  timestamp: nowIso()
});
