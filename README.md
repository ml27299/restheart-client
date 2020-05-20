# Introduction
Restheart is a popular mongo rest api, this package aims to make it easier to use by abstracting the endpoints to mongoose-like methods.

This package also aims to optimize working with Restheart by providing automatic timeout and retry handling.

Supports >=node@4.x.x

## Getting started
RestHeartClient(params{})
- params:
    - token(string): used to authenticate to restheart
    - (Required) baseUrl(string): the url to where restheart is exposed
    - database(string | default = "http://localhost"): the name of the database in restheart you want to target
    - options(object):
        - noPageLimit(bool | default = false): set a no page limit so that you get all records from collection (does a series of requests using the pagesize as its limit for each request)
        - pagesize(number | default = 100): set the max number of records the client will get at once
        - timestamps(object):
            - created_at(bool | number | string default = true): sets a created_at timestamp when a record is created, you can change the name of the field by providing a string instead of a bool or number 
            - updated_at(bool | number | string default = true): sets a updated_at timestamp when a record is created or updated, you can change the name of the field by providing a string instead of a bool or number 
```javascript
import RestHeartClient from "restheart-client";
const client = new RestHeartClient({
    token: "some token",
    baseUrl: "restheart url",
    database: "mydatabasename"
});
```

### client.getModels(options{})
This method implicitly figures out the collections in your database by making a request to restheart
- options(object): options passed in will be used for every collection found
    - noPageLimit(bool | default = false): set a no page limit so that you get all records from collection (does a series of requests using the pagesize as its limit for each request)
    - pagesize(number | default = 100): set the max number of records the client will get at once

```javascript
client.getModels().then(({mycollection: MyCollection}) => {
    //...do stuff with MyCollection
}); 
```

### client.getModel(name, options{})
This method targets a collection explicitly
- (Required) name(string): The name of the collection you want to target
- options(object):
    - noPageLimit(bool | default = false): set a no page limit so that you get all records from collection (does a series of requests using the pagesize as its limit for each request)
    - pagesize(number | default = 100): set the max number of records the client will get at once

```javascript
const MyCollection = client.getModel("mycollection");
//do stuff with MyCollection
```


