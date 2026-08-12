/**
 * Utility helper to standardize all visual date and time formatting
 * specifically targeted for Vietnam (UTC+7 / Asia/Ho_Chi_Minh).
 */
export function formatVNTime(value: any): string {
  if (!value) return "";
  try {
    let d: Date;
    if (value && typeof value.toDate === 'function') {
      d = value.toDate();
    } else if (value && typeof value.seconds === 'number') {
      d = new Date(value.seconds * 1000);
    } else if (value instanceof Date) {
      d = value;
    } else {
      d = new Date(value);
    }
    if (isNaN(d.getTime())) return "";
    
    return d.toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour12: false,
    });
  } catch {
    return "";
  }
}

/**
 * Utility helper to standardize visual date-only formatting (DD/MM/YYYY)
 * without time components.
 */
export function formatVNDate(value: any, fallbackValue?: any): string {
  if (!value && !fallbackValue) return "";

  const processVal = (val: any): string => {
    if (!val) return "";

    // 1. If Firestore Timestamp object or Date
    if (typeof val === 'object') {
      const d = parseDate(val);
      if (d) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }
    }

    const strVal = String(val).trim();
    if (!strVal) return "";

    // 2. Ignore pure time strings like "10:23:53" or "10:23"
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(strVal)) {
      return "";
    }

    // 3. Exact DD/MM/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(strVal)) {
      const [d, m, y] = strVal.split('/');
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }

    // 4. Exact YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(strVal)) {
      const [y, m, d] = strVal.split('-');
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }

    // 5. ISO string with T e.g. 2026-08-11T18:36:01
    if (strVal.includes('T')) {
      const datePart = strVal.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        const [y, m, d] = datePart.split('-');
        return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
      }
    }

    // 6. Regex match for DD/MM/YYYY or YYYY-MM-DD inside strings (e.g. "10:23:53, 11/08/2026")
    const ddmmMatch = strVal.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (ddmmMatch) {
      const [, d, m, y] = ddmmMatch;
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }

    const yyyyMatch = strVal.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (yyyyMatch) {
      const [, y, m, d] = yyyyMatch;
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }

    // 7. Parse date object fallback
    const d = parseDate(val);
    if (d) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }

    return "";
  };

  const res = processVal(value);
  if (res) return res;
  if (fallbackValue) return processVal(fallbackValue);
  return "";
}

/**
 * Safely converts any date value (ISO string, Firestore Timestamp, Date, or object with seconds)
 * into an ISO date string format (YYYY-MM-DD), or empty string if invalid.
 */
export function toIsoDateString(value: any): string {
  if (!value) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.includes("T")) {
      return trimmed.split("T")[0];
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
      const [d, m, y] = trimmed.split("/");
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
  }
  const d = parseDate(value);
  if (d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return "";
}

/**
 * Safely parses any date value (ISO string, Firestore Timestamp, plain object with seconds, or Date)
 * into a standard javascript Date object, or returns null if invalid.
 */
export function parseDate(value: any): Date | null {
  if (!value) return null;
  try {
    let d: Date;
    if (value && typeof value.toDate === 'function') {
      d = value.toDate();
    } else if (value && typeof value.seconds === 'number') {
      d = new Date(value.seconds * 1000);
    } else if (value instanceof Date) {
      d = value;
    } else {
      if (typeof value === 'string' && /^\d{1,2}:\d{2}(:\d{2})?$/.test(value.trim())) {
        return null;
      }
      d = new Date(value);
    }
    if (isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
}
