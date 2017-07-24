# magento2-client
Access Magento2 API

## Install with npm

npm install magento2-client

## usage

You can create a Magento2-Client with this information:

<table>
  <tbody>
    <tr>
      <th align="center">Information</th>
      <th align="center">Definition</th>
    </tr>
    <tr>
      <td align="left">
				baseUrl
      </td>
      <td align="left">
				A string. This is the URL of the front end of the Magento2 install.  Example <pre>https://www.example.com</pre>.
      </td>
		</tr>
		<tr>
      <td align="left">
				username
      </td>
      <td align="left">
				A string. This is the username to login to the backend of the Magento2 install.  Example, <pre>username</pre>.
      </td>
		</tr>
		<tr>
      <td align="left">
				password
      </td>
      <td align="left">
				A string. This is the password to login to the backend of the Magento2 install. Example, <pre>password</pre>.
      </td>
		</tr>
  </tbody>
</table>

### example
```
const Magento = require('magento2-client');

var magento = new Magento('https://www.example.com', 'username', 'password', {});
```

The last parameters is an options object.  See notes below.

You can look at the Magento2 API here:  [http://devdocs.magento.com/guides/v2.0/rest/list.html](http://devdocs.magento.com/guides/v2.0/rest/list.html).

To use the `magento` client created above to make requests, use the request interface:

```
magento.request(method, url, urlParams, data, callback);
```

where the parameters are defined as follows:


<table>
  <tbody>
    <tr>
      <th align="center">Parameter</th>
      <th align="center">Definition</th>
    </tr>
    <tr>
      <td align="left">
				method
      </td>
      <td align="left">
				A string. 'POST', 'GET', 'PUT', 'DELETE'
      </td>
		</tr>
		<tr>
      <td align="left">
				url
      </td>
      <td align="left">
				A string. The REST endpoint. Example: '/V1/products'.
      </td>
		</tr>
		<tr>
      <td align="left">
				urlParams
      </td>
      <td align="left">
				A JSON object. This is key values of url parameters.  Example: 
<pre>
  { 
    'searchCriteria[pageSize]': 10,
    'searchCriteria[currentPage]': 1 
  }
</pre>
      </td>
    </tr>
    <tr>
      <td align="left">
				data
      </td>
      <td align="left">
				A JSON object. This is the body of the request.  Example:
<pre>
  {
      "entity": {
          "carrierCode":"UPS",
          "orderId":23594,
          "parent_id":35569,
          "title":"ground",
          "trackNumber":"12345678"
      }
  }
</pre>
      </td>
    </tr>
    <tr>
      <td align="left">
				callback
      </td>
      <td align="left">
        If using promises, omit this parameter.  If using callbacks, this is the callback function.  The signature of the callback is:
<pre>
  function(err, data) { 
    if (err) {
      // handle error
    }
    // do something with your data
    console.log('data = ' + JSON.stringify(data, null, 2));
  })
</pre>
      </td>
		</tr>
  </tbody>
</table>

## Examples

With callback:
```
magento.request('GET',                      //method
                '/V1/categories',           //url
                { searchCriteria: "\'\'" }, //urlParams
                {},                         //data
                function(err, data) {       //callback
  console.log('categories CALLBACK= ' + JSON.stringify(data, null, 2));
});

magento.request('GET',                      //method
                '/V1/orders',               //url
                {                           //urlParams
                  'searchCriteria[pageSize]': 10,
                  'searchCriteria[currentPage]': 1 
                },
                {},                         //data
                function(err, data) {       //callback
 console.log('orders CALLBACK = ' + JSON.stringify(data, null, 2));
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
2. There is a DEFAULT_VERSION set at 'V1'.  This is used to get the authorization token.  If you need to overide this, you can set it in the options of the `new` parameters.  For example, if you want to use 'V2', you could do this.  This is only for getting the Authorization token with the username and password.  All the other routes are sent in the url parameter of the request method.
```
var magento = new Magento('https://www.example.com', 'username', 'password', 
  {
    'options': 'V2'
  });

```
