import {serialize, deserialize, required, isArray} from "./helper";
import Model from "./Model";

const log = require('debug')("mongooseclient:template");

class Template {

    collection;
    connection;
    options;

    constructor(collection = required`collection`, connection = required`connection`, options = {}) {
        this.collection = collection;
        this.connection = connection;

        if (!this.collection) throw(new Error("Template class requires a collection"));
        if (!this.connection) throw(new Error("Template class requires a connection"));

        this.options = options;
    }

    get __updatedAt() {
        const {timestamps} = this.options;
        if (!timestamps || !timestamps["updated_at"]) return {};
        const name = timestamps["updated_at"];
        const updated_at = typeof name === "string" ? name : "updated_at";
        return {"$currentDate": {[`${updated_at}`]: true}};
    }

    get __createdAt() {
        const {timestamps} = this.options;
        if (!timestamps || !timestamps["created_at"]) return {};
        const name = timestamps["created_at"];
        const created_at = typeof name === "string" ? name : "created_at";
        return {"$currentDate": {[`${created_at}`]: true}};
    }

    get timestamps() {
        if (!this.__updatedAt && !this.__createdAt) return {};
        if (!this.__updatedAt && this.__createdAt) return this.__createdAt;
        if (!this.__createdAt && this.__updatedAt) return this.__updatedAt;
        return {$currentDate: Object.assign({}, this.__createdAt["$currentDate"], this.__updatedAt["$currentDate"])};
    }

    findOne(query = {}, options = {}) {

        const connection = this.connection;
        const params = Object.assign(
            {
                collection: this.collection,
                pagesize: 1
            },
            Object.keys(query).length > 0 ? {filter: JSON.stringify(deserialize(query, Object.assign({}, this.options, options)))} : {},
            options
        );

        const supported = {
            select: 1,
            raw: 1
        };

        return new Model({
            params,
            options: Object.assign({}, this.options, options),
            name: "findOne",
            supported,
            resolver: async function (options = {}, params = required`params`) {
                try {
                    let response = await connection.listDocuments(params);
                    if (!options.raw) response = serialize(response, options);
                    return response["_embedded"] ? response["_embedded"][0] : undefined;
                } catch (err) {
                    throw(err);
                }
            }
        });
    }

    find(query = {}, options = {}) {

        const connection = this.connection;
        const params = Object.assign(
            {collection: this.collection},
            Object.keys(query).length > 0 ? {filter: JSON.stringify(deserialize(query, Object.assign({}, this.options, options)))} : {},
            options
        );

        const supported = {
            populate: 1,
            select: 1,
            raw: 1,
            skip: 1,
            limit: 1,
            page: 1,
            sort: 1,
            noPageLimit: 1
        };

        return new Model({
            params,
            options: Object.assign({}, this.options, options),
            name: "find",
            supported,
            resolver: async (options = {}, params = required`params`) => {
                log({options, params});
                let response = [];
                try {
                    if (options.noPageLimit) {
                        const {_total_pages, _returned, _embedded} = await connection.count(params);
                        response = response.concat(_embedded);
                        const promises = [];
                        let count = 0;
                        for (let i = params.page || 1; i < _total_pages; i++) {
                            count++;
                            if (options.limit && count * _returned > options.limit) break;
                            promises.push(connection.listDocuments(Object.assign({}, params, {
                                pagesize: _returned,
                                page: i + 1
                            })));
                        }
                        const results = await Promise.all(promises);
                        results.forEach(({_embedded}) => response = response.concat(_embedded))
                    } else {
                        const {_embedded} = await connection.listDocuments(params) || {};
                        response = _embedded || [];
                    }

                    log("response length:", response.length);

                    if (options.skip) {
                        if (options.skip < options.og_pagesize || params.page === 1) response = response.slice(
                            options.noPageLimit ? 0 : options.skip,
                            response.length
                        ); else response = response.slice(
                            options.skipIsPrime ? 1 : 0,
                            options.noPageLimit ? response.length : options.og_pagesize + (options.skipIsPrime ? 1 : 0)
                        );
                    }
                    if (options.limit) response = response.slice(0, options.limit);
                    if (!options.raw) return serialize(response, options);
                    return response;
                } catch (err) {
                    throw(err);
                }
            }
        });
    }

    create(document = required`document`, options = {}) {
        if (!Array.isArray(document)) {
            options.originallyObject = true;
            document = [document];
        }

        const connection = this.connection;
        document = document.map(doc => Object.assign({}, doc, this.timestamps));

        const params = Object.assign({
            collection: this.collection,
            document: deserialize(document, Object.assign({}, this.options, options))
        }, options);

        return new Model({
            params,
            options: Object.assign({}, this.options, options),
            name: "create",
            resolver: async (options = {}, params = required`params`) => {
                log({options, params});
                try {
                    let response = await connection.insert(params);
                    if (!options.raw && response) response = serialize(response, options);
                    return options.originallyObject ?
                        response["_embedded"] ? response["_embedded"][0] : undefined : response["_embedded"];
                } catch (err) {
                    throw(err);
                }
            }
        });
    }

    update(query = required`query`, document = {}, options = {}) {
        if (isArray(query)) {
            document = query;
            query = {};
        }

        const connection = this.connection;
        const params = Object.assign(
            {
                collection: this.collection,
                document: deserialize(Object.assign(document, this.__updatedAt), this.options)
            },
            Object.keys(query).length > 0 ? {filter: JSON.stringify(deserialize(query, Object.assign({}, this.options, options)))} : {},
            options
        );

        return new Model({
            params,
            options: Object.assign({}, this.options, options),
            name: "update",
            resolver: async (options = {}, params = required`params`) => {
                try {
                    let response = await connection.update(params);
                    if (!options.raw && response) response = serialize(response, options);
                    return response;
                } catch (err) {
                    throw(err);
                }
            }
        });
    }

    count(query = {}, options = {}) {

        const connection = this.connection;
        const params = Object.assign(
            {
                collection: this.collection,
                pagesize: 1
            },
            Object.keys(query).length > 0 ? {filter: JSON.stringify(deserialize(query, Object.assign({}, this.options, options)))} : {},
            options
        );

        return new Model({
            params,
            options: Object.assign({}, this.options, options),
            name: "count",
            resolver: async (options = {}, params = required`params`) => {
                try {
                    const response = await connection.count(params);
                    return response._size;
                } catch (err) {
                    throw(err);
                }
            }
        });
    }

    remove(document = required`document`, options = {}) {
        const connection = this.connection;
        const params = Object.assign(
            {
                collection: this.collection,
                document: deserialize(document, this.options)
            },
            document ? {filter: JSON.stringify(deserialize(document, Object.assign({}, this.options, options)))} : {},
            options
        );

        return new Model({
            params,
            options: Object.assign({}, this.options, options),
            name: "destroy",
            resolver: async (options = {}, params = required`params`) => {
                try {
                    return await connection.delete(params);
                } catch (err) {
                    throw(err);
                }
            }
        });
    }
}

export default Template;