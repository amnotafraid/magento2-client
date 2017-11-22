/**
 * Magento2
 */

const http          = require('http');
const https         = require('https');

const DEFAULT_PORT = 80;
const DEFAULT_VERSION = 'V1'

/**
 * getLocation
 *
 *   This is available in Node v7 with require('url').URL.
 *   This will work Node v < 7
 *
 * @param string href
 */
function getLocation(href) {
    let match = href.match(/^(http|https)?\:\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
        href: href,
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        pathname: match[5],
        search: match[6],
        hash: match[7]
    }
};

/**
 * Magento2 constructor
 *
 * @param  string baseUrl
 * @param  string adminUsername
 * @param  string adminPassword
 * @param  object options
 */
var Magento2 = function(baseUrl, adminUsername, adminPassword, options) {

  if (baseUrl) {
    this.init(baseUrl, adminUsername, adminPassword, options);
  }
};

/**
 * Initialize client parameters
 *
 * @param  string baseUrl
 * @param  string adminUsername
 * @param  string adminPassword
 * @param  object options
 */
Magento2.prototype.init = function(baseUrl, adminUsername, adminPassword, options) {

  options = options || {};

  let location = getLocation(baseUrl);

  if (location.protocol !== 'https') {
    console.log(`WARNING! live Magento installs should have https protocol`);
  }

  this.params = {
    baseUrl: baseUrl,
    protocol: (location.protocol == 'https' ? https : http),
    host: location.host,
    port: options.port || DEFAULT_PORT,
    adminUsername: adminUsername,
    adminPassword: adminPassword,
    token: '',
    version: options.version || DEFAULT_VERSION,
  };

  if (!this.params.baseUrl) {
    throw new Error('Magento2 `baseUrl` of Magento site is required to initialize');
  }
  if (!this.params.adminUsername) {
    throw new Error('Magento2 `adminUsername` of Magento site is required to initialize');
  }
  if (!this.params.adminPassword) {
    throw new Error('Magento2 `adminPassword` of Magento site is required to initialize');
  }
};

/**
 * Magento2 getBaseUrl
 *
 */
Magento2.prototype.getBaseUrl = function() {
  return this.params.baseUrl;
}
/**
 * Magento2 request handler
 *
 * @param  string method
 * @param  string url
 * @param  mixed urlParams
 * @param  mixed data
 * @param  function callback
 */
Magento2.prototype.request = function(method, url, urlParams, data, callback) {

  let self = this;
  let totalUrl = '/rest';
  let urlParamString = '';

  if (Object.keys(urlParams).length > 0) {
    urlParamString += Object.keys(urlParams).map(function(k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(urlParams[k]);
    }).join('&');
  }

  if (typeof(data) === 'string'){
    console.log('WARNING! data parameter was passed as a string but a JSON object was expected.  Attempting to convert to JSON');
    data = JSON.parse(data);
  }

  totalUrl += url;

  if (urlParamString.length > 0) {
    totalUrl += '?';
    totalUrl += urlParamString;
  }

  let aPromises = self.promisifyData(data);

  if (aPromises.length) {
    return Promise.all(aPromises).bind(this).then(function() {
      this.request(method, url, urlParams, data, callback);
    });
  }
  
  let req;

  if (callback) {
    self.getTokenCallback(function (err) {
      let options = {
        host: self.params.host,
        path: totalUrl,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization' : 'Bearer ' + self.params.token,
        }
      };

      req = self.params.protocol.request(options, 
        function(res) {
          let response = '';
          res.on('data', function (chunk) {
            response += chunk;
          });
          res.on('end', function() {
            if (res.statusCode === 200) {
              callback(null, JSON.parse(response));
            }
            else {
              callback("Message: " + JSON.parse(response).message + " Parameters: " + JSON.stringify(JSON.parse(response).parameters));
            }
          });
        });

      req.on('error', function(e) {
        callback(e.message);
      });

      req.write(JSON.stringify(data));
      req.end();
    });
  }
  else {
    return self.getTokenPromise ().then(() => {
      return new Promise(function (resolve, reject) {
        let options = {
          host: self.params.host,
          path: totalUrl,
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization' : 'Bearer ' + self.params.token,
          }
        };

        req = self.params.protocol.request(options, function(res) {
          let response = '';
          res.on('data', function (chunk) {
            response += chunk;
          });
          res.on('end', function() {
            if (res.statusCode === 200) {
              resolve(JSON.parse(response));
            }
            else {
              reject(response.message);
            }
          });
        });

        req.on('error', function(e) {
          reject(e.message);
        });

        req.write(JSON.stringify(data));
        req.end();
      });
    })
    .catch((err) => {
      console.log(err);
    });
  }
};


/**
 * Resolve and return promises array from data
 * Only resolve top level object keys
 *
 * @param  object data
 * @return array
 */
Magento2.prototype.promisifyData = function(data) {

  if (!data) {
    return [];
  }

  function thenResolvePromisedValue(data, key) {
    data[key].then(function(val) {
      data[key] = val;
    });
  }

  let promises = [];
  if (typeof data === 'object') {
    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      if (data[key] && data[key].then) {
        promises.push(data[key]);
        thenResolvePromisedValue(data, key);
      }
    }
  } else if (data instanceof Array) {
    for (let i = 0; i < data.length; i++) {
      if (data[i] && data[i].then) {
        promises.push(data[i]);
        thenResolvePromisedValue(data, i);
      }
    }
  }

  return promises;
};

/**
 * Magento2 getTokenCallback
 *
 * @param callback(err, data)
 */
Magento2.prototype.getTokenCallback = function(callback) {
  let self = this;
  if (self.params.token.length > 0) {
    callback(null);
  }
  else {
    let options = {
      host: self.params.host,
      path: '/rest/' + self.params.version + '/integration/admin/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    let data = {
      username: self.params.adminUsername,
      password: self.params.adminPassword
    };

    let req = self.params.protocol.request(options, function(res) {
      let response = '';
      res.on('data', function (chunk) {
        response += chunk;
      });
      res.on('end', function() {
        if (res.statusCode === 200) {
          self.params.token = JSON.parse(response);
          callback(null);
        }
        else {
          callback(response.message);
        }
      });
    });

    req.on('error', function(e) {
      callback(e.message);
    });

    req.write(JSON.stringify(data));
    req.end();
  }
};

/**
 * Magento2 getTokenPromise
 *
 * @return object Promise
 */
Magento2.prototype.getTokenPromise = function() {
  let self = this;
  return new Promise(function (resolve, reject) {
    if (self.params.token.length > 0) {
      resolve();
    }
    else {
      let options = {
        host: self.params.host,
        path: '/rest/' + self.params.version + '/integration/admin/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      };

      let data = {
        username: self.params.adminUsername,
        password: self.params.adminPassword
      };

      let req = self.params.protocol.request(options, function(res) {
        let response = '';
        res.on('data', function (chunk) {
          response += chunk;
        });
        res.on('end', function() {
          if (res.statusCode === 200) {
            self.params.token = JSON.parse(response);
            resolve();
          }
          else {
            reject(response.message);
          }
        });
      });

      req.on('error', function(e) {
        reject(e.message);
      });

      req.write(JSON.stringify(data));
      req.end();
    }
  });
};

/**
 * Magento2 create/init helper
 *
 * @param  string baseUrl
 * @param  string token
 * @param  object options
 * @return object Magento2
 */
Magento2.create = function(baseUrl, adminUsername, adminPassword, options) {
  return new Magento2(baseUrl, adminUsername, adminPassword, options);
};

// Exports
module.exports = Magento2;
module.exports.createMagento2 = Magento2.create;
