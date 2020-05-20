import assert from "assert";

import {
    BigTestCollection,
    TestCollection
} from "./resources/client";

describe("count", function () {
    it("should return 510 for bigtestcollection", function (done) {
        BigTestCollection.count().then(collectionSize => {
            try {
                assert.deepStrictEqual(collectionSize, 510);
                done();
            } catch (err) {
                done(err);
            }
        }).catch(done);
    });
    it("should return 4 for testcollection", function (done) {
        TestCollection.count().then(collectionSize => {
            try {
                assert.deepStrictEqual(collectionSize, 4);
                done();
            } catch (err) {
                done(err);
            }
        }).catch(done);
    });
    it("should return 46 records that are less than 1000 in bigtestcollection", function (done) {
        BigTestCollection.count({data: {"$lt": 1000}}).then(collectionSize => {
            try {
                assert.deepStrictEqual(collectionSize, 46);
                done();
            } catch (err) {
                done(err);
            }
        }).catch(done);
    })
});