import { randomBytes } from "node:crypto";
export { randomBytes };
export const toHex = (bytes) => {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
};
//# sourceMappingURL=index.js.map