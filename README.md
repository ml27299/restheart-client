# Introduction
Restheart is a popular mongo rest api, this package aims to make it easier to use by abstracting the endpoints to mongoose-like methods.

This package also aims to optimize working with Restheart by providing automatic timeout and retry handling.

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
- params:
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

## Sub-Methods
### raw(val = (true | false) default = true)
Call the raw method when you want to return the response without serialization, which means objectids look like {"$oid": "someObjectId"}
```javascript
(async () => {
    const response = await MyCollection.findOne().raw();
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
    await MyCollection.find().select({field1: 1, field2: 1});
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