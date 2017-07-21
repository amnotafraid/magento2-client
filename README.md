# shipperhq-client
Access ShipperHQ API

## Install with npm

npm install shipperhq-client

## usage

const Magento     = require('./magento2');

var magento = new Magento('https://www.example.com', 'username', 'password', {});

With callback:
```
magento.request('GET', //method
                '/V1/categories', //url
                { searchCriteria: "\'\'" }, //urlParams
                {}, //data
                function(err, data) { //callback
  console.log('data = ' + JSON.stringify(data, null, 2));
});

magento.request('GET', //method
                '/V1/orders', //url
                { 'searchCriteria[pageSize]': 10,
                  'searchCriteria[currentPage]': 1 }, //urlParams
                {}, //data
                function(err, data) { //callback
// console.log('data = ' + JSON.stringify(data, null, 2));
});
```

With promises:
```
magento.requestPromise('GET', //method
                '/V1/orders', //url
                { 'searchCriteria[pageSize]': 10,
                  'searchCriteria[currentPage]': 1 }, //urlParams
                {}) //data
  .then((data) => { 
    console.log('PROMISE data = ' + JSON.stringify(data, null, 2));
  })
  .catch((err) => {
    console.log(err);
  });

magento.requestPromise('GET', //method
                '/V1/products', //url
                { 'searchCriteria[pageSize]': 10,
                  'searchCriteria[currentPage]': 1 }, //urlParams
                {}) //data
  .then((data) => { 
    console.log('PROMISE data = ' + JSON.stringify(data, null, 2));
  })
  .catch((err) => {
    console.log(err);
  });
```

