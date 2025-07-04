const {
    v4: uuidv4
} = require("uuid");
const Visit = require("../models/visitors");
const getClientIp = require("../utils/getClientIP");
const ONE_HOUR = 60 * 60 * 1000;

exports.recordVisit = async (req, res) => {
    try {
        let visitorId = req.cookies?.visitor_id;
        const now = new Date();

        if (!visitorId) {
            visitorId = uuidv4();
            res.cookie("visitor_id", visitorId, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000, // 1 day
                sameSite: "Lax",
                secure: process.env.NODE_ENV === "production",
            });
        }

        const {
            ip,
            country
        } = getClientIp(req);

        // Check if a recent visit was already recorded (e.g., within 1 hour)
        const recentVisit = await Visit.findOne({
            visitor_id: visitorId,
            createdAt: {
                $gt: new Date(now - ONE_HOUR)
            },
        });

        if (!recentVisit) {
            await Visit.create({
                visitor_id: visitorId,
                ip_address: ip,
                country,
                user_agent: req.headers["user-agent"] || "",
            });
        }

        res.status(200).json({
            message: "Visit recorded (or already logged recently)."
        });
    } catch (error) {
        console.error("Error recording visit:", error);
        res.status(500).json({
            error: "Internal server error."
        });
    }
};

exports.getVisitStats = async (req, res) => {
    try {
        const {
            startDate,
            endDate
        } = req.query;

        let filter = {};

        // Optional date filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const visits = await Visit.find(filter).select("visitor_id createdAt");

        const totalVisits = visits.length;

        const uniqueVisitors = new Set(visits.map((v) => v.visitor_id)).size;

        res.status(200).json({
            totalVisits,
            uniqueVisitors,
            startDate: startDate || "all time",
            endDate: endDate || "all time",
        });
    } catch (error) {
        console.error("Error fetching visit stats:", error);
        res.status(500).json({
            error: "Internal server error"
        });
    }
};