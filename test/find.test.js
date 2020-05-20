import assert from "assert";

import {
    BigTestCollection,
    TestCollection,
    NonExistentTestCollection
} from "./resources/client";

describe('find', function () {
    describe("default", function () {
        it('should get 0 records from nonexistenttestcollection', function (done) {
            NonExistentTestCollection.find().then(response => {
                try {
                    assert.deepStrictEqual(response.length, 0);
                    done();
                } catch (err) {
                    done(err);
                }
            }).catch(done);
        });
        it('should get 4 records from testcollection', function (done) {
            TestCollection.find().then(response => {
                try {
                    assert.deepStrictEqual(response.length, 4);
                    done();
                } catch (err) {
                    done(err);
                }
            }).catch(done);
        });
        it('should get 0 records from testcollection where active is true', function (done) {
            TestCollection.find({active: true}).then(response => {
                try {
                    assert.deepStrictEqual(response.length, 0);
                    done();
                } catch (err) {
                    done(err);
                }
            }).catch(done);
        });
    });
    describe("select", function () {
        it('_id - should return an array of 4 objects with only _id as an index', function (done) {
            TestCollection.find().select("_id").then(response => {
                try {
                    response.forEach(item => {
                        assert.deepStrictEqual(Object.keys(item).length, 1, "more than one key in object");
                        assert.deepStrictEqual(Object.keys(item)[0], "_id");
                    });
                    assert.deepStrictEqual(response.length, 4);
                    done();
                } catch (err) {
                    done(err);
                }
            }).catch(done);
        });
        it('{_id: 1} - should return an array of 4 objects with only _id as an index', function (done) {
            TestCollection.find().select({_id: 1}).then(response => {
                try {
                    response.forEach(item => {
                        assert.deepStrictEqual(Object.keys(item).length, 1, "more than one key in object");
                        assert.deepStrictEqual(Object.keys(item)[0], "_id");
                    });
                    assert.deepStrictEqual(response.length, 4);
                    done();
                } catch (err) {
                    done(err);
                }
            }).catch(done);
        });
    });
    describe("limit", function () {
        it('should get 1 record from testcollection', function (done) {
            TestCollection.find().limit(1).then(response => {
                try {
                    assert.deepStrictEqual(response.length, 1);
                    done();
                } catch (err) {
                    done(err);
                }
            }).catch(done);
        });
        it('should get 1 record after skipping 1 from testcollection', function (done) {
            TestCollection.find().then(list => {
                TestCollection.find().limit(1).skip(1).then(response => {
                    try {
                        assert.deepStrictEqual(response.length, 1, "more than one record");
                        assert.deepStrictEqual(list[1], response[0], "skip mismatch");
                        done();
                    } catch (err) {
                        done(err);
                    }
                }).catch(done);
            }).catch(done);
        });
        it('should get 200 record from bigtestcollection', function (done) {
            BigTestCollection.find().limit(200).then(response => {
                try {
                    assert.deepStrictEqual(response.length, 200);
                    done();
                } catch (err) {
                    done(err);
                }
            }).catch(done);
        });
        it('should get 200 record after skipping 101 rec from bigtestcollection', function (done) {
            BigTestCollection.find().page(2).then(list => {
                BigTestCollection.find().limit(200).skip(101).then(response => {
                    try {
                        assert.deepStrictEqual(response.length, 200);
                        assert.deepStrictEqual(list[1], response[0], "skip mismatch");
                        done();
                    } catch (err) {
                        done(err);
                    }
                }).catch(done);
            }).catch(done);
        });
    });
    describe("skip", function () {
        it('should skip 1 record from testcollection', function (done) {
            TestCollection.find().then(list => {
                TestCollection.find().skip(1).then(response => {
                    try {
                        assert.deepStrictEqual(response.length, 3);
                        assert.deepStrictEqual(list[1], response[0], "skip mismatch");
                        done();
                    } catch (err) {
                        done(err);
                    }
                }).catch(done);
            });
        });
        it('should skip 101 records from bigtestcollection', function (done) {
            BigTestCollection.find({}, {pagesize: 200}).limit(110).then(list => {
                BigTestCollection.find().skip(101).then(response => {
                    try {
                        assert.deepStrictEqual(response.length, 100);
                        assert.deepStrictEqual(list[101], response[0], "skip mismatch");
                        done();
                    } catch (err) {
                        done(err);
                    }
                }).catch(done);
            });
        });
        it('should skip 1 and limit the response to 1 record from testcollection', function (done) {
            TestCollection.find().then(list => {
                TestCollection.find().skip(1).limit(1).then(response => {
                    try {
                        assert.deepStrictEqual(response.length, 1, "more than one record in response");
                        assert.deepStrictEqual(list[1], response[0], "skip mismatch");
                        done();
                    } catch (err) {
                        done(err);
                    }
                }).catch(done);
            });
        });
    });
    describe("noPageLimit", function () {
        it('should return all items in bigtestcollection', function (done) {
            BigTestCollection.count().then(collectionSize => {
                BigTestCollection.find().noPageLimit().then(response => {
                    try {
                        assert.deepStrictEqual(
                            response.length < BigTestCollection.options.pagesize,
                            false,
                            "response length is not greater than the pagesize"
                        );
                        assert.deepStrictEqual(
                            response.length,
                            collectionSize,
                            "response length does not match collection size"
                        );
                        done();
                    } catch (err) {
                        done(err);
                    }
                }).catch(done);
            }).catch(done);
        });
    });
    describe("raw", function () {
        it('should return response that has $oid for objectIds', function (done) {
            TestCollection.find().raw().then(response => {
                try {
                    assert.deepStrictEqual(Object.keys(response[0]._id)[0], "$oid");
                    done();
                } catch (err) {
                    done(err);
                }
            }).catch(done);
        });
        it("should return row with _id 5ec30e14ec2079cb83e2817e in its raw form", function (done) {
            TestCollection.find({_id: "5ec30e14ec2079cb83e2817e"}).raw().then(response => {
                try {
                    assert.deepStrictEqual(response.length, 1);
                    assert.deepStrictEqual(Object.keys(response[0]._id)[0], "$oid");
                    assert.deepStrictEqual(response[0]._id["$oid"], "5ec30e14ec2079cb83e2817e");
                    done();
                } catch (err) {
                    done(err);
                }
            }).catch(done);
        });
    });
    describe("sort", function () {
        it("should return response sorted in ascending order from bigtestcollection", function (done) {
            BigTestCollection.find().sort({data: 1}).then(response => {
                for (let i = 0; i < response.length; i++) {
                    if (i === 0) continue;
                    assert.deepStrictEqual(response[i].data >= response[i - 1].data, true);
                }
                done();
            }).catch(done);
        });
        it("should return response sorted in descending order from bigtestcollection", function (done) {
            BigTestCollection.find().sort({data: -1}).then(response => {
                for (let i = 0; i < response.length; i++) {
                    if (i === 0) continue;
                    assert.deepStrictEqual(
                        response[i].data <= response[i - 1].data,
                        true,
                        `index ${i} > ${i - 1} (${response[i].data} > ${response[i - 1].data})`
                    );
                }
                done();
            }).catch(done);
        });
    });
});