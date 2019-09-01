const NodeCron = require("node-cron");
const _ = require("lodash");
const { OzBargain } = require("./services/ozbargain");
const Slack = require("./services/slack");

let initialised = false;
let ready = true;
let rssFeedSilo = [];

const rssUrls = [
    {
        link: "https://www.ozbargain.com.au/cat/electrical-electronics/deals/feed",
        refreshInterval: 15000
    },
    {
        link: "https://www.ozbargain.com.au/cat/computing/deals/feed",
        refreshInterval: 15000
    },
    {
        link: "https://www.ozbargain.com.au/cat/dining-takeaway/deals/feed",
        refreshInterval: 15000
    },
    {
        link: "https://www.ozbargain.com.au/cat/mobile/deals/feed",
        refreshInterval: 15000
    }
];

const ozBargainSubscriber = new OzBargain(rssUrls);

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

NodeCron.schedule('* * * * *', async () => {
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
