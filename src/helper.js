import BSON, {EJSON} from "bson";

const ObjectId = BSON.ObjectId;

export const isObject = (obj) => Object.prototype.toString.call(obj) === '[object Object]';
export const isArray = Array.isArray;
export const isBoolean = val => 'boolean' === typeof val;
export const required = (param) => throw (new Error(`Missing parameter: ${param}`));

function isObjectId(value) {
    try {
        const asString = value.toString();
        const asObjectId = new ObjectId(asString);
        return asString === asObjectId.toString();
    } catch (error) {
        return false;
    }
}

export const deserialize = (data, options = {}) => {
    let response = JSON.parse(EJSON.stringify(data, {relaxed: true}));

    function recursive(obj) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key) === false) continue;
            if (key === "$oid") continue;
            if (isObject(obj[key])) obj[key] = recursive(obj[key]);
            else if (isArray(obj[key])) obj[key] = obj[key].map(item => {
                if (isObject(item)) return recursive(item);
                else if (isObjectId(item)) return new ObjectId(item);
            }); else if (isObjectId(obj[key])) obj[key] = new ObjectId(obj[key]);
        }
        return obj;
    }

    if (!options.raw) recursive(response);
    return JSON.parse(EJSON.stringify(response, {relaxed: true}));
};

export const serialize = (data, options = {}) => {
    let response = EJSON.parse(EJSON.stringify(data, {relaxed: true}), {relaxed: true});

    function recursive(obj) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key) === false) continue;
            if (isObject(obj[key]) && !isObjectId(obj[key])) obj[key] = recursive(obj[key]);
            else if (isArray(obj[key])) obj[key] = obj[key].map(item => {
                if (isObject(item) && !isObjectId(item)) return recursive(item);
                else if (isObjectId(item)) return item.toString();
            }); else if (isObjectId(obj[key])) obj[key] = obj[key].toString();
        }
        return obj;
    }

    if (!options.raw) recursive(response);
    return response;
};