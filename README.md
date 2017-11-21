# magento2-client
Access Magento2 API

## Install with npm

npm install magento2-client

## usage

### Parameters

You can create a Magento2-Client with these parameters:

| Parameter     | Data Type   | Definition                                                                        |
| ------------- | ----------- | --------------------------------------------------------------------------------- |
| baseUrl       | String      | This is the URL of the front end of the Magento installation. Example: 'https://www.example.com'. <br/>This can optionally contain a base path like: 'https://www.example.com/rel-5.3.2' |
| username      | String      | This is the username to login to the Magento2 admin console.                      |
| password      | String      | This is the password for the supplied Magento2 admin username.                    |
| options       | JSON Object | **Optional** Contains any optional connection parameters.                         |

### Options

These options are allowed in the options object parameter

| Name               | Data Type | Default | Definition                                                           |
| ------------------ | --------- | ------- | -------------------------------------------------------------------- |
| version            | String    | V1      | Magento API version to use when getting the authorization token.     |
| rejectUnauthorized | boolean   | true    | If set to false, self signed or bad SSL certificates will be allowed |


### Example, create magento-client
```
const Magento = require('magento2-client');

var magento = new Magento('https://www.example.com', 'username', 'password', {version: "v1", rejectUnauthorized: true});
```

Magento API documentation:  [http://devdocs.magento.com/guides/v2.0/rest/list.html](http://devdocs.magento.com/guides/v2.0/rest/list.html).

To use the `magento` client created above to make requests, use the request interface:

```
magento.request(method, url, urlParams, data, callback);
```

where the parameters are defined as follows:

| Parameter | Data Type   | Definition                                                           |
| ----------| ----------- | -------------------------------------------------------------------- |
| method    | String      | HTTP method to use, 'POST', 'GET', 'PUT', 'DELETE'
| url       | String      | The REST endpoint. Example: '/V1/products'.
| urlParams | JSON Object | Key value pairs representing URL parameters. Example: <br/>   `{ 'searchCriteria[pageSize]': 10, 'searchCriteria[currentPage]': 1 } `
| data      | JSON Object | The body to send to the request. Example: <br/>   `{"attributeSet":{"attribute_set_name":"Pants","entity_type_id":4},"skeletonId":4}`
| callback  | function    | The callback function to trigger after completing the request.  Follows the standard (err, data) model

## Examples, call request method

With callback:
```
magento.request('GET',                      //method
                '/V1/categories',           //url
                { searchCriteria: "\'\'" }, //urlParams
                {},                         //data
                function(err, data) {       //callback
  if (err) {
    // TODO handle errors
  }
  console.log('categories = ' + JSON.stringify(data, null, 2));
});

magento.request('GET',                      //method
                '/V1/orders',               //url
                {                           //urlParams
                  'searchCriteria[pageSize]': 10,
                  'searchCriteria[currentPage]': 1 
                },
                {},                         //data
                function(err, data) {       //callback
  if (err) {
    // TODO handle errors
  }
  console.log('orders = ' + JSON.stringify(data, null, 2));
});
```

With promises:
```
magento.request('GET',                    //method
                '/V1/orders',             //url
                {                         //urlParams
                  'searchCriteria[pageSize]': 10,
                  'searchCriteria[currentPage]': 1 
                }, 
                {})                       //data
  .then((data) => { 
    console.log('orders = ' + JSON.stringify(data, null, 2));
  })
  .catch((err) => {
    // TODO handle errors
    console.log(err);
  });

magento.request('GET',                    //method
                '/V1/products',           //url
                {                         //urlParams
                  'searchCriteria[pageSize]': 10,
                  'searchCriteria[currentPage]': 1 
                }, 
                {})                       //data
  .then((data) => { 
    console.log('products = ' + JSON.stringify(data, null, 2));
  })
  .catch((err) => {
    // TODO handle errors
  });
```
## Notes:

1. A real Magento install should use https protocol.  This module will work with an http site with a warning... Sometimes, you just need to test things out...
2. An error with a message 'unable to verify the first certificate' indicates that the server is using a self signed certificate. Setting the rejectUnauthorized option to **false** will bypass this and display a warning, but this should only be used in test environments.
```
var magento = new Magento("https://www.example.com", "username", "password", {"rejectUnauthorized": false});
```
3. There is a DEFAULT_VERSION set at 'V1'.  This is used to get the authorization token.  If you need to overide this, you can set it in the options of the `new` parameters.  For example, if you want to use 'V2', you could do this.  This is only for getting the Authorization token with the username and password.  All the other routes are sent in the url parameter of the request method.
```
var magento = new Magento("https://www.example.com", "username", "password", {"options": "V2"});
```
4.  For convenience, there is a getBaseUrl function:
```
let baseUrl = magento.getBaseUrl();
```

