import "regenerator-runtime";

import MongoRest from "./MongoRest";
import Template from "./Template";
import {required} from "./helper";

class MongooseClient extends MongoRest {

    options = {
        noPageLimit: false,
        pagesize: 100,
        timestamps: {
            "created_at": 1,
            "updated_at": 1
        }
    };

    constructor({token, database = required`database`, baseUrl, cluster, options} = {}) {
        super({database, baseUrl, cluster, token});
        Object.assign(this.options, options);
    }

    async getModels(options = {}) {
        try {
            const collections = await this.listCollections();
            const templates = collections["_embedded"]
                .map(({_id: name}) => new Template(name, this, Object.assign(this.options, options)));
            return templates.reduce((result, template) => Object.assign(result, {[`${template.collection}`]: template}), {});
        } catch (err) {
            throw(err);
        }
    }

    getModel(name = required`name`, options = {}) {
        if (!name) throw(new Error("Model name is required"));
        return new Template(name, this, Object.assign(this.options, options));
    }
}

export default MongooseClient;