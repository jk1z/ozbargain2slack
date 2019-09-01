const Env = require("../env");
const Request = require("request-promise-native");

exports.sendMessage = async (payload) => {
    return Request.post({
        uri: Env.SLACK_WEBHOOK_URL,
        form: JSON.stringify(payload)
    });
};