import {isBoolean, isObject, required} from "./helper";

class Model {
    constructor({name = required`name`, params = {}, options = {}, supported = {}, resolver = required`resolver`}) {
        Object.assign(this, {
            params,
            name,
            options,
            resolver,
            supported
        });
    }

    isSupported(methodName = required`methodName`) {
        if (this.supported[methodName]) return true;
        throw(new Error(`${this.name} does not support method ${methodName}`));
    }

    then(resolve = required`resolve`, reject) {
        return this.exec(this.options).then(resolve).catch(reject);
    }

    catch(func = required`func`) {
        return this.then(Promise.resolve.bind(Promise), Promise.reject.bind(Promise)).catch(func);
    }

    async exec(options = {}) {
        try {
            options = Object.assign({}, this.options, options);
            if (!this.resolver) return;
            return await this.resolver(options, this.params);
        } catch (err) {
            throw(err);
        }
    }

    page(num = 1) {
        if (this.options.noPageLimit) throw(new Error("page method cannot be used when noPageLimit is true"));
        try {
            if (this.isSupported("page")) {
                this.params.page = num;
                return this;
            }
        } catch (err) {
            throw(err);
        }
    }

    limit(num = 0) {
        if (this.options.pagesize < num) throw("limit cannot be greater than pagesize");
        try {
            if (this.isSupported("limit")) {
                this.options.limit = num;
                this.params.pagesize = num || this.options.pagesize;
                if (this.options.skip) return this.skip(this.options.skip);
                return this;
            }
        } catch (err) {
            throw(err);
        }
    }

    skip(num = 0) {
        try {
            const getPage = (num, limit) => {
                if (num < limit) return;
                const isPrime = (num) => {
                    for (let i = 2, s = Math.sqrt(num); i <= s; i++)
                        if (num % i === 0) return false;
                    return num > 1;
                };
                if (isPrime(num)) {
                    this.options.skipIsPrime = true;
                    num = num - 1;
                }
                for (let i = 2; i < num; i++) {
                    if (num % i === 0 && num / i <= limit * 2 && num / i >= limit) return i;
                }
            };
            if (this.isSupported("skip")) {
                const pagesize = this.params.pagesize || this.options.pagesize;
                this.options.skip = num;
                this.options.og_pagesize = pagesize;
                const page = getPage(num, pagesize / 2);
                if (!page) {
                    if (this.options.skipIsPrime) num = num - 1;
                    this.params.pagesize = num <= pagesize ? num : pagesize;
                    this.params.page = num <= pagesize ? 2 : 1;
                } else {
                    if (this.options.skipIsPrime) num = num - 1;
                    this.params.pagesize = (num / page);
                    this.params.page = page + 1;
                }
                if (this.options.noPageLimit === false) {
                    this.options.limit = this.options.og_pagesize;
                }
                this.options.noPageLimit = true;
                return this;
            }
        } catch (err) {
            throw(err);
        }
    }

    sort(value = required`value`) {
        try {
            if (this.isSupported("sort")) {
                this.params.sort = JSON.stringify(value);
                return this;
            }
        } catch (err) {
            throw(err);
        }
    }

    select(val = "") {
        try {
            if (this.isSupported("select")) {
                if (isObject(val)) {
                    this.params.keys = val;
                    return this;
                }
                this.params.keys = JSON.stringify(val.split(" ")
                    .reduce((result, field) => Object.assign({[`${field}`]: 1}), {}));
                return this;
            }
        } catch (err) {
            throw(err);
        }
    }

    raw(val = true) {
        try {
            if (this.isSupported("raw")) {
                this.options.raw = val;
                return this;
            }
        } catch (err) {
            throw(err);
        }
    }

    noPageLimit(input = true) {
        try {
            if (this.isSupported("noPageLimit")) {
                if (isBoolean(input)) {
                    const {noPageLimit, pagesize} = this.options;
                    if (input === true) this.options.noPageLimit = {
                        batchesOf: noPageLimit ? noPageLimit.batchesOf || pagesize : pagesize
                    };
                    else if (input === false) this.options.noPageLimit = false;
                    return this;
                }
                const {batchesOf} = input;
                this.options.noPageLimit = {batchesOf: batchesOf || this.options.pagesize};
                return this;
            }
        } catch (err) {
            throw(err);
        }
    }

    populate(options = {}) {
        try {
            if (this.isSupported("populate")) {
                this.options.sort = options;
                return this;
            }
        } catch (err) {
            throw(err);
        }
    }
}

export default Model;