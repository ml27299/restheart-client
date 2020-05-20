import assert from "assert";

import {
    DynamicTestCollection,
    TestCollection
} from "./resources/client";

describe("update", function () {
    it("(5ec30e14ec2079cb83e2817e) should update 1 record", function (done) {
        TestCollection.update({_id: "5ec30e14ec2079cb83e2817e"}, {data: 55}).then(response => {
            TestCollection.findOne({_id: "5ec30e14ec2079cb83e2817e"}).then(updatedResponse => {
                try {
                    assert.deepStrictEqual(updatedResponse.data, 55);
                    assert.deepStrictEqual(response["modified"], 1);
                    assert.deepStrictEqual(response["matched"], 1);
                    done();
                } catch (err) {
                    done(err);
                }
            }).catch(done);
        }).catch(done);
    });
    it("(array) should update 3 record", function (done) {
        const ids = ["5ec30e14ec2079cb83e2817e", "5ec30e1cec2079cb83e2817f", "5ec30e32ec2079cb83e28181"];
        const dataFunc = () => Math.floor(Math.random() * (10000 - 1) + 1);
        const input = ids.map(id => ({_id: id, data: dataFunc()}));
        const {timestamps} = DynamicTestCollection.options;
        TestCollection.find({_id: {"$in": ids}}).then(beforeResponse => {
            TestCollection.update(input).then(updateResponse => {
                TestCollection.find({_id: {"$in": ids}}).then(afterResponse => {
                    try {
                        const updated_at_timestamp = typeof timestamps["updated_at"] === "string" ?
                            timestamps["updated_at"] : "updated_at";
                        afterResponse.forEach(afterItem => {
                            const inputItem = input.find(item => item.data === afterItem.data);
                            assert.deepStrictEqual(!!inputItem, true);
                            const beforeItem = beforeResponse.find(beforeItem => beforeItem._id === afterItem._id);
                            delete afterItem[updated_at_timestamp];
                            delete beforeItem[updated_at_timestamp];
                            delete afterItem["_etag"];
                            delete beforeItem["_etag"];
                            assert.deepStrictEqual(Object.assign({}, beforeItem, {data: inputItem.data}), afterItem);
                        });
                        assert.deepStrictEqual(updateResponse["modified"], 3);
                        assert.deepStrictEqual(updateResponse["matched"], 3);
                        done();
                    } catch (err) {
                        done(err);
                    }
                }).catch(done);
            }).catch(done);
        }).catch(done);
    });
    it("(query) should update 3 record", function (done) {
        const ogData = 200;
        const ids = ["5ec30e14ec2079cb83e2817e", "5ec30e1cec2079cb83e2817f", "5ec30e32ec2079cb83e28181"];
        const {timestamps} = DynamicTestCollection.options;
        TestCollection.find({_id: {"$in": ids}}).then(beforeResponse => {
            TestCollection.update({_id: {"$in": ids}}, {"$set": {data: ogData}}).then(updateResponse => {
                TestCollection.find({_id: {"$in": ids}}).then(afterResponse => {
                    try {
                        const updated_at_timestamp = typeof timestamps["updated_at"] === "string" ?
                            timestamps["updated_at"] : "updated_at";
                        afterResponse.forEach(afterItem => {
                            assert.deepStrictEqual(afterItem.data, ogData);
                            const beforeItem = beforeResponse.find(beforeItem => beforeItem._id === afterItem._id);
                            delete afterItem[updated_at_timestamp];
                            delete beforeItem[updated_at_timestamp];
                            delete afterItem["_etag"];
                            delete beforeItem["_etag"];
                            assert.deepStrictEqual(Object.assign({}, beforeItem, {data: ogData}), afterItem);
                        });
                        assert.deepStrictEqual(updateResponse["modified"], 3);
                        assert.deepStrictEqual(updateResponse["matched"], 3);
                        done();
                    } catch (err) {
                        done(err);
                    }
                }).catch(done);
            }).catch(done);
        }).catch(done);
    });
});