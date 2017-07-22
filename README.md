# magento2-client
Access Magento2 API

## Install with npm

npm install shipperhq-client

## usage
```
const Magento     = require('./magento2');

var magento = new Magento('https://www.example.com', 'username', 'password', {});
```
With callback:
```
magento.request('GET', //method
                '/V1/categories', //url
                { searchCriteria: "\'\'" }, //urlParams
                {}, //data
                function(err, data) { //callback
  console.log('categories CALLBACK= ' + JSON.stringify(data, null, 2));
});

magento.request('GET', //method
                '/V1/orders', //url
                { 'searchCriteria[pageSize]': 10,
                  'searchCriteria[currentPage]': 1 }, //urlParams
                {}, //data
                function(err, data) { //callback
 console.log('orders CALLBACK = ' + JSON.stringify(data, null, 2));
});
```

With promises:
```
magento.request('GET', //method
                '/V1/orders', //url
                { 'searchCriteria[pageSize]': 10,
                  'searchCriteria[currentPage]': 1 }, //urlParams
                {}) //data
  .then((data) => { 
    console.log('PROMISE orders = ' + JSON.stringify(data, null, 2));
  })
  .catch((err) => {
    console.log(err);
  });

magento.request('GET', //method
                '/V1/products', //url
                { 'searchCriteria[pageSize]': 10,
                  'searchCriteria[currentPage]': 1 }, //urlParams
                {}) //data
  .then((data) => { 
    console.log('PROMISE products = ' + JSON.stringify(data, null, 2));
  })
  .catch((err) => {
    console.log(err);
  });
```

