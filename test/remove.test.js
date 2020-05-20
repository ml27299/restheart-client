import assert from "assert";

import {
    DynamicTestCollection
} from "./resources/client";

describe("remove", function () {
    it("should remove 1 record from dynamictestcollection", function (done) {
        DynamicTestCollection.find().then(list => {
            DynamicTestCollection.remove({_id: list[0]._id}).then(removeResponse => {
                DynamicTestCollection.findOne({_id: list[0]._id}).then(response => {
                    try {
                        assert.deepStrictEqual(removeResponse.deleted, 1);
                        assert.deepStrictEqual(response, undefined);
                        done();
                    } catch (err) {
                        done(err);
                    }
                }).catch(done);
            }).catch(done);
        }).catch(done);
    });
    it("should error out", function (done) {
        DynamicTestCollection.find().then(list => {
            DynamicTestCollection.remove({}).then(removeResponse => {
                done(new Error("should not have passed"));
            }).catch(() => {
                done();
            });
        }).catch(done);
    });
});