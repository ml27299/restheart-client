import assert from "assert";

import {
    DynamicTestCollection
} from "./resources/client";

describe("create", function () {
    it("should create 1 record in dynamictestcollection", function (done) {
        const data = Math.floor(Math.random() * (10000 - 1) + 1);
        const {timestamps} = DynamicTestCollection.options;
        DynamicTestCollection.create({data}).then(response => {
            try {
                assert.deepStrictEqual(Array.isArray(response), false);
                assert.deepStrictEqual(response.data, data);
                const updated_at_timestamp = typeof timestamps["updated_at"] === "string" ?
                    timestamps["updated_at"] : "updated_at";
                const created_at_timestamp = typeof timestamps["created_at"] === "string" ?
                    timestamps["created_at"] : "created_at";
                assert.deepStrictEqual(
                    !!response[updated_at_timestamp],
                    !!timestamps["updated_at"],
                    `updated_at: ${response[updated_at_timestamp]}`
                );
                assert.deepStrictEqual(
                    !!response[created_at_timestamp],
                    !!timestamps["created_at"],
                    `created_at: ${response[created_at_timestamp]}`
                );
                done();
            } catch (err) {
                done(err);
            }
        }).catch(done);
    });
    it("should create 5 record in dynamictestcollection", function (done) {
        const limit = 5;
        const dataFunc = () => Math.floor(Math.random() * (10000 - 1) + 1);
        const {timestamps} = DynamicTestCollection.options;
        const createObjs = [...Array(limit).keys()].map(() => ({data: dataFunc()}));
        DynamicTestCollection.create(createObjs).then(response => {
            try {
                assert.deepStrictEqual(Array.isArray(response), true);
                assert.deepStrictEqual(response.length, limit);
                const reverseOG = createObjs.reverse();
                response.forEach((item, i) => {
                    assert.deepStrictEqual(item.data, reverseOG[i].data);
                    const updated_at_timestamp = typeof timestamps["updated_at"] === "string" ?
                        timestamps["updated_at"] : "updated_at";
                    const created_at_timestamp = typeof timestamps["created_at"] === "string" ?
                        timestamps["created_at"] : "created_at";
                    assert.deepStrictEqual(
                        !!item[updated_at_timestamp],
                        !!timestamps["updated_at"],
                        `updated_at: ${item[updated_at_timestamp]}`
                    );
                    assert.deepStrictEqual(
                        !!item[created_at_timestamp],
                        !!timestamps["created_at"],
                        `created_at: ${item[created_at_timestamp]}`
                    );
                });
                done();
            } catch (err) {
                done(err);
            }
        }).catch(done);
    });
});