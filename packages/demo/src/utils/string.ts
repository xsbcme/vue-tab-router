export default {
  uuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  },
  jsonToObject<T extends string | object>(val: T, def = {}): object {
    try {
      if (val === null || val === undefined) {
        return def;
      }
      if (typeof val !== "string") {
        return val;
      }
      return JSON.parse(val);
    } catch {
      return def;
    }
  },
};
