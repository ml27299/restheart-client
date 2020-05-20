import ax from "axios";
import axiosRetry from 'axios-retry';

import {required} from "./helper";

axiosRetry(ax, {retries: 3});

const axTimeout = 1000 * 3;
const debugLog = require('debug')("mongooseclient:axios");
const log = (response, isError) => debugLog(`
    url: ${response.config.url}
    method: ${response.config.method}
    status: ${response.status}
    params: ${JSON.stringify(response.config.params)}
    data: ${JSON.stringify(response.config.data)}
    isError: ${!!isError}
`);

export const get = async ({url = required`url`, token, params = {}}) => {
    try {
        const response = await ax({
            method: "get",
            url,
            timeout: axTimeout,
            headers: Object.assign(token ? {'Authorization': `Bearer ${token}`} : {}, {
                'Content-Type': 'application/json;charset=UTF-8'
            }),
            params
        });
        log(response);
        return [response.data, response];
    } catch (err) {
        if (err.response) log(err.response, true);
        throw(err);
    }
};

export const post = async ({url = required`url`, token, params, data}) => {
    try {
        const response = await ax({
            method: "post",
            url,
            timeout: axTimeout,
            headers: Object.assign(token ? {'Authorization': `Bearer ${token}`} : {}, {
                'Content-Type': 'application/json;charset=UTF-8'
            }),
            data: data,
            params
        });
        log(response);
        return [response.data, response];
    } catch (err) {
        if (err.response) log(err.response, true);
        throw(err);
    }
};

export const patch = async ({url = required`url`, token, params, data}) => {
    try {
        const response = await ax({
            method: "patch",
            url,
            timeout: axTimeout,
            headers: Object.assign(token ? {'Authorization': `Bearer ${token}`} : {}, {
                'Content-Type': 'application/json;charset=UTF-8'
            }),
            data,
            params
        });
        log(response);
        return [response.data, response];
    } catch (err) {
        if (err.response) log(err.response, true);
        throw(err);
    }
};

export const put = async ({url = required`url`, token, params, data}) => {
    try {
        const response = await ax({
            method: "put",
            url,
            timeout: axTimeout,
            headers: Object.assign(token ? {'Authorization': `Bearer ${token}`} : {}, {
                'Content-Type': 'application/json;charset=UTF-8'
            }),
            data,
            params
        });
        log(response);
        return [response.data, response];
    } catch (err) {
        if (err.response) log(err.response, true);
        throw(err);
    }
};

export const destroy = async ({url = required`url`, token, params, data}) => {
    try {
        const response = await ax({
            method: "delete",
            url,
            timeout: axTimeout,
            headers: Object.assign(token ? {'Authorization': `Bearer ${token}`} : {}, {
                'Content-Type': 'application/json;charset=UTF-8'
            }),
            data,
            params
        });
        log(response);
        return [response.data, response];
    } catch (err) {
        if (err.response) log(err.response, true);
        throw(err);
    }
};