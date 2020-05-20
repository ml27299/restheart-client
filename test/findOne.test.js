import assert from "assert";

import {
    TestCollection,
    NonExistentTestCollection
} from "./resources/client";

describe('findOne', function () {
    describe("default", function () {
        it("(5ec30e14ec2079cb83e2817e) should return undefined for nonexistenttestcollection", function (done) {
            NonExistentTestCollection.findOne({_id: "5ec30e14ec2079cb83e2817e"}).then(response => {
                try {
                    assert.deepStrictEqual(response, undefined, `response is ${typeof response}`);
                    done();
                } catch (err) {
                    done(err);
                }
            }).catch(done);
        });
        it("(5ec30e14ec2079cb83e2817e) should return record for testcollection", function (done) {
            TestCollection.findOne({_id: "5ec30e14ec2079cb83e2817e"}).then(response => {
                try {
                    assert.deepStrictEqual(response._id, "5ec30e14ec2079cb83e2817e", `response _id is ${response._id}`);
                    done();
                } catch (err) {
                    done(err);
                }
            }).catch(done);
        });
        it("should return first record of testcollection", function (done) {
            TestCollection.find().then(list => {
                TestCollection.findOne().then(response => {
                    try {
                        assert.deepStrictEqual(response, list[0]);
                        done();
                    } catch (err) {
                        done(err);
                    }
                }).catch(done);
            }).catch(done);
        });
    });
    describe("select", function () {
        it("(5ec30e14ec2079cb83e2817e) select = _id - should return record with only the _id field for testcollection", function (done) {
            TestCollection.findOne({_id: "5ec30e14ec2079cb83e2817e"}).select("_id").then(response => {
                try {
                    assert.deepStrictEqual(response._id, "5ec30e14ec2079cb83e2817e", `response _id is ${response._id}`);
                    assert.deepStrictEqual(Object.keys(response).length, 1, "more than one key in object");
                    assert.deepStrictEqual(Object.keys(response)[0], "_id");
                    done();
                } catch (err) {
                    done(err);
                }
            }).catch(done);
        });
        it("(5ec30e14ec2079cb83e2817e) select = {_id: 1} - should return record with only the _id field for testcollection", function (done) {
            TestCollection.findOne({_id: "5ec30e14ec2079cb83e2817e"}).select({_id: 1}).then(response => {
                try {
                    assert.deepStrictEqual(response._id, "5ec30e14ec2079cb83e2817e", `response _id is ${response._id}`);
                    assert.deepStrictEqual(Object.keys(response).length, 1, "more than one key in object");
                    assert.deepStrictEqual(Object.keys(response)[0], "_id");
                    done();
                } catch (err) {
                    done(err);
                }
            }).catch(done);
        });
    });
    describe("raw", function () {
        it("(5ec30e14ec2079cb83e2817e) should return record with objectIds as $oid", function (done) {
            TestCollection.findOne({_id: "5ec30e14ec2079cb83e2817e"}).raw().then(response => {
                try {
                    assert.deepStrictEqual(response._id["$oid"], "5ec30e14ec2079cb83e2817e", `response _id is ${response._id}`);
                    assert.deepStrictEqual(Object.keys(response._id)[0], "$oid");
                    done();
                } catch (err) {
                    done(err);
                }
            }).catch(done);
        });
    });
});