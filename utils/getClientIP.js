// utils/getClientIp.js
const geoip = require("geoip-lite");

function getClientIp(req) {
    const ip =
        req.headers["x-forwarded-for"]?.split(",").shift()?.trim() ||
        req.socket?.remoteAddress ||
        null;

    // Normalize local IP
    const normalizedIp = ip === "::1" ? "127.0.0.1" : ip;

    // Geolocation
    const geo = geoip.lookup(normalizedIp);

    return {
        ip: normalizedIp,
        country: geo?.country || "Unknown",
    };
}

module.exports = getClientIp;