# Introduction
[Restheart](https://restheart.org/) is a popular mongo rest api, this package aims to make it easier to use by abstracting the endpoints to mongoose-like methods.

This package also aims to optimize working with Restheart by
- automated timeout/retry handling
- encapsulate http endpoints to more relatable functions
- handles the dirty work with edge cases such as creating a record on a non existent collection
- serialize objectIds to strings
- add methods like limit/skip
- ability to get all records from a collection

Supports >=node@4.x.x

## Getting started
### Options
options can be passed in on all levels of the package
- **noPageLimit(bool | default = false):** set a no page limit so that you get all records from collection (does a series of requests using the pagesize as its limit for each request)
- **pagesize(number | default = 100):** set the max number of records the client will get at once
- **raw(bool | default = false):** returns records as restheart returns records (with $oid on object ids) 
- **timestamps(object):**
    - **created_at(bool | number | string default = true):** sets a created_at timestamp when a record is created, you can change the name of the field by providing a string instead of a bool or number 
    - **updated_at(bool | number | string default = true):** sets a updated_at timestamp when a record is created or updated, you can change the name of the field by providing a string instead of a bool or number 

### RestHeartClient(params{})
- **params:**
    - **token(string):** used to authenticate to restheart
    - **(Required) baseUrl(string):** the url to where restheart is exposed
    - **database(string | default = "http://localhost"):** the name of the database in restheart you want to target
    - [options](#options)
```javascript
import RestHeartClient from "restheart-client";
const client = new RestHeartClient({
    token: "some token",
    baseUrl: "restheart url",
    database: "mydatabasename"
});
```

### client.getModels([options](#options){})
This method implicitly figures out the collections in your database by making a request to restheart
```javascript
client.getModels().then(({mycollection: MyCollection}) => {
    /*...do stuff with MyCollection*/
}); 
```

### client.getModel(name, [options](#options){})
This method targets a collection explicitly
- **(Required) name(string):** The name of the collection you want to target
```javascript
const MyCollection = client.getModel("mycollection");
/*...do stuff with MyCollection*/
```
## Methods (examples in async/await but promises work too)
### findOne(query{}, [options](#options){}) (can be chained with sub-methods)
This method returns a single record from a collection
```javascript
(async () => {
    await MyCollection.findOne().catch(err => {
        /*...do something on error*/
    });
    /*...do something with the response*/
})();
```
Supported sub-methods
- [select](#selectval--string--object)
- [raw](#rawval--true--false-default--true)

### find(query{}, [options](#options){})
This method returns a list of records from a collection
```javascript
(async () => {
    await MyCollection.find().catch(err => {
        /*...do something on error*/
    });
    /*...do something with the response*/
})();
```
Supported sub-methods
- [select](#selectval--string--object)
- [raw](#rawval--true--false-default--true)
- [limit](#limitnum--number-default--0)
- [skip](#skipnum--number-default--0)
- [sort](#sortval--)
- [page](#pagenum--number-default--1)
- [noPageLimit](#nopagelimitval--true--false-default-true)

### create(document = object | array, [options](#options){})
This method creates a record or a list of records in a target collection.
If the create method is called on a collection that doesnt exist yet, then it will create the collection then create the record.
```javascript
(async () => {
    const response = await MyCollection.create({field1: "someValue"}).catch(err => {
        /*...do something on error*/
    });
    console.log(response) //{_id: "someObjectId", field1: "someValue"}
    /*...do something with the response*/
})();
```
Supported sub-methods
- [raw](#rawval--true--false-default--true)

### update(query = object | array, document{}, [options](#options){})
This method updates a record or a list of records in a target collection.
If query is an array, then a bulk update will be done, which means each record in the array MUST contain the _id 
```javascript
(async () => {
    await MyCollection.update({field1: "someValue"}, {"$set": {field1: "otherValue"}}).catch(err => {
        /*...do something on error*/
    });
    //alternatively
    await MyCollection.update({field1: "someValue"}, {field1: "otherValue"}).catch(err => {
        /*...do something on error*/    
    });
    //alternatively
    await MyCollection.update([{_id: "someObjectId", field1: "otherValue"}]).catch(err => {
        /*...do something on error*/    
    });
})();
```
Supported sub-methods
- none

### remove(document{}, [options](#options){})
This method removes a record or a list of records in a target collection
```javascript
(async () => {
    await MyCollection.remove({field1: "someValue"}).catch(err => {
        /*...do something on error*/
    });
    /*...do something with the response*/
})();
```
Supported sub-methods
- none

## Sub-Methods (examples in async/await but promises work too)
sub-methods can be chained

### raw(val = (true | false) default = true)
Call the raw method when you want to return the response without serialization, which means objectids look like {"$oid": "someObjectId"}
```javascript
(async () => {
    const response = await MyCollection.findOne({_id: "someObjectId"}).raw();
    console.log(response); //{_id: {"$oid": "someObjectId"}, ...}
})();
```
### select(val = string | object)
Call the select method when you want select fields only (_id is always returned no matter what)
```javascript
(async () => {
    const response = await MyCollection.find().select("field1 field2"); 
    console.log(response); //[{_id: "someObjectId", field1: "someVal", field2: "otherValue"}  ...}]
    //alternatively
    await MyCollection.findOne({_id: "someObjectId"}).select({field1: 1, field2: 1});
})();
```
### skip(num = number default = 0)
Call the skip method to control where restheart begins returning results.
If there're more rows in a collection than the set "pagesize" then the skip method will make multiple calls (each call less than or equal to the set "pagesize") to respond with the set "pagesize".
```javascript
(async () => {
    await MyCollection.find().skip(10);
})();
```
### limit(num = number default = 0)
Call the limit method to control how many results to return in the response.
If the limit number is greater than the pagesize, then multiple calls will be made to reach the limit
```javascript
(async () => {
    await MyCollection.find().limit(10);
})();
```
### sort(val = {})
Call the sort method when you want to return the records sorted by some field
```javascript
(async () => {
    await MyCollection.find().sort({field: 1}); //ascending order
})();
```
### page(num = number default = 1)
Call the page method when you want to control which page to return
```javascript
(async () => {
    await MyCollection.find().page(5); //assuming pagesize = 100, returns results 400-500
})();
```
### noPageLimit(val = (true | false) default true)
Call the noPageLimit method when you want to return all records in a collection.
If there're more records in the collection than the set "pagesize" then multiple requests will be made
```javascript
(async () => {
    const count = await MyCollection.count();
    const response = await MyCollection.find().noPageLimit();
    console.log(response.length === count) //true
})();
```