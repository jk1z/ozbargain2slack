const NodeCron = require("node-cron");
const _ = require("lodash");
const { OzBargain } = require("./services/ozbargain");
const Slack = require("./services/slack");
const Env = require("./env");

let initialised = false;
let ready = true;
let rssFeedSilo = [];

// const rssConfig = [
//     {
//         link: "https://www.ozbargain.com.au/cat/electrical-electronics/deals/feed",
//         refreshInterval: 15000
//     },
//     {
//         link: "https://www.ozbargain.com.au/cat/computing/deals/feed",
//         refreshInterval: 15000
//     },
//     {
//         link: "https://www.ozbargain.com.au/cat/dining-takeaway/deals/feed",
//         refreshInterval: 15000
//     },
//     {
//         link: "https://www.ozbargain.com.au/cat/mobile/deals/feed",
//         refreshInterval: 15000
//     }
// ];

const ozBargainSubscriber = new OzBargain(Env.RSS_CONFIG);

ozBargainSubscriber.subscribe((item) => {
    let done = false;
    while (!done){
        if (ready){
            rssFeedSilo.push({
                title: item.title,
                link: item.link,
                thumbnail: _.get(item, "image.url")
            });
            done = true;
        }
    }
});

const task = NodeCron.schedule('* * * * *', async () => {
    if (!initialised){
        rssFeedSilo = [];
        initialised = true;
        return;
    }
    ready = false;
    try {
        if (!_.isEmpty(rssFeedSilo)) {
            const blocks = [];
            for (const item of rssFeedSilo) {
                blocks.push(exports.decorateRss(item));
                blocks.push({"type": "divider"});
            }
            blocks.pop();
            await Slack.sendMessage({blocks});
            console.log("New item sent to slack:", JSON.stringify(rssFeedSilo, null, 3));
            rssFeedSilo = [];
        }
    } catch (err){
        console.error(err);
    }
    ready = true;
});

exports.decorateRss = (rssItem) => {
    return {
        type: "section",
        text: {
            type: "mrkdwn",
            text: `<${rssItem.link}|${rssItem.title}>`
        },
        accessory: {
            type: "image",
            image_url: _.get(rssItem, "thumbnail", ""),
            alt_text: "thumbnail image"
        }
    }
};

process.on("SIGHUP", async () => {
    await initializeGracefulExit("SIGHUP");
});

process.on("SIGTERM", async () => {
    await initializeGracefulExit("SIGTERM");
});

process.on("SIGINT", async () => {
    await initializeGracefulExit("SIGINT");
});

const initializeGracefulExit = async (signal) => {
    task.destroy();
    ozBargainSubscriber.subsriber.destroy();
};
