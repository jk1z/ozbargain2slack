exports.SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || "http://localhost";
exports.RSS_CONFIG = JSON.parse(process.env.RSS_CONFIG) || [];
exports.TZ = process.env.TZ || "Australia/Melbourne";
exports.NODE_ENV = process.env.NODE_ENV;