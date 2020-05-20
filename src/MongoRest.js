import * as Http from "./Http";
import {required} from "./helper";

const log = require('debug')("mongooseclient:app");

class MongoRest {

    token;
    database;
    cluster;
    baseUrl = "http://localhost";

    constructor({token, database = required`database`, baseUrl, cluster}) {
        if (baseUrl) this.baseUrl = baseUrl;
        this.database = database;
        this.cluster = cluster;
        this.token = token;
        log(`Connected to ${this.database}${this.cluster ? `on cluster ${this.cluster}` : ""} at ${this.baseUrl}`);
    }

    async createCollection(options = {}) {
        try {
            const collection = options.collection;
            const database = options.database || this.database;
            const url = `${this.baseUrl}/${this.cluster ? `clusters/${this.cluster}/` : ""}${database}/${collection}`;
            const [data] = await Http.put({url, token: this.token, data: {description: ""}});
            return data;
        } catch (err) {
            throw(err);
        }
    }

    async listCollections(options = {}) {
        try {
            const database = options.database || this.database;
            const url = `${this.baseUrl}/${this.cluster ? `clusters/${this.cluster}/` : ""}${database}`;
            const [data] = await Http.get({url, token: this.token});
            return data;
        } catch (err) {
            throw(err);
        }
    }

    async listDocuments(options = {}) {
        if (!options.collection) throw(new Error("must have a collection"));
        try {
            const collection = options.collection;
            const database = options.database || this.database;
            const {filter, count, keys, sort, page, pagesize} = options;
            const url = `${this.baseUrl}/${this.cluster ? `clusters/${this.cluster}/` : ""}${database}/${collection}`;

            const params = {filter, count, keys, sort, page, pagesize};
            const [data] = await Http.get({url, token: this.token, params}) || {};
            return data;
        } catch (err) {
            if (err.response && err.response.status === 404) return [];
            throw(err);
        }
    }

    async count(options = {}) {
        if (!options.collection) throw(new Error("must have a collection"));
        try {
            const collection = options.collection;
            const database = options.database || this.database;
            const {filter, page, pagesize} = options;
            const url = `${this.baseUrl}/${this.cluster ? `clusters/${this.cluster}/` : ""}${database}/${collection}`;

            const params = {filter, count: true, page, pagesize};
            const [data] = await Http.get({url, token: this.token, params});
            return data;
        } catch (err) {
            throw(err);
        }
    }

    async insert(options = {}, forceExitOnError = false) {
        if (!options.collection) throw(new Error("must have a collection"));
        if (!options.document) throw(new Error("must have a document"));
        try {
            const collection = options.collection;
            const database = options.database || this.database;
            const document = options.document;
            const url = `${this.baseUrl}/${this.cluster ? `clusters/${this.cluster}/` : ""}${database}/${collection}`;

            const [_, response] = await Http.post({url, token: this.token, data: document});
            const {etag} = response.headers;
            return await this.listDocuments(Object.assign({}, options, {
                filter: JSON.stringify({_etag: {"$oid": etag}})
            }));
        } catch (err) {
            try {
                if (err.response && err.response.status === 404 && !forceExitOnError) {
                    await this.createCollection(options);
                    return await this.insert(options, true);
                }
            } catch (err) {
                throw(err);
            }
            throw(err);
        }
    }

    async update(options = {}) {
        if (!options.collection) throw(new Error("must have a collection"));
        if (!options.document) throw(new Error("must have a document"));
        if (Array.isArray(options.document)) {
            const _idNotFound = options.document.find(item => !!item._id === false);
            if (_idNotFound) throw(new Error("_id is required"));
        }
        try {
            const collection = options.collection;
            const database = options.database || this.database;
            const document = options.document;
            const {filter, key} = options;

            const params = {filter, key};
            if (Array.isArray(document)) {
                const url = `${this.baseUrl}/${this.cluster ? `clusters/${this.cluster}/` : ""}${database}/${collection}`;
                const [data] = await Http.post({url, token: this.token, data: document, params});
                return data;
            } else {
                const url = `${this.baseUrl}/${this.cluster ? `clusters/${this.cluster}/` : ""}${database}/${collection}/*`;
                const [data] = await Http.patch({url, token: this.token, data: document, params});
                return data;
            }
        } catch (err) {
            throw(err);
        }
    }

    async delete(options = {}) {
        if (!options.collection) throw(new Error("must have a collection"));
        if (!options.document) throw(new Error("must have a document"));
        try {
            const collection = options.collection;
            const database = options.database || this.database;
            const document = options.document;
            const {filter} = options;
            const url = `${this.baseUrl}/${this.cluster ? `clusters/${this.cluster}/` : ""}${database}/${collection}/*`;

            const params = {filter};
            const [data] = await Http.destroy({url, token: this.token, data: document, params});
            return data;
        } catch (err) {
            throw(err);
        }
    }
}

export default MongoRest;