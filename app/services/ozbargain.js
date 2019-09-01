const _ = require("lodash");
const RssFeedEmitter = require("rss-feed-emitter");

class OzBargain {
    constructor(rssUrls = []) {
        if (!!OzBargain.instance) {
            return OzBargain.instance;
        }

        OzBargain.instance = this;

        this.rssUrls = rssUrls;
        this.subsriber = new RssFeedEmitter();

        if (!_.isEmpty(this.rssUrls)){
            for (const rssUrl of this.rssUrls) {
                this.subsriber.add({
                    url: rssUrl.link,
                    refresh: rssUrl.refreshInterval
                });
            }
        }

        return this;
    }

    subscribe(subscribeFunc){
        this.subsriber.on("new-item", async (item) => {
            if (subscribeFunc instanceof Promise){
                await subscribeFunc(item);
            } else {
                subscribeFunc(item);
            }
        });
    };

}

exports.OzBargain = OzBargain;