/**
 * Magento2
 */

const http          = require('http');
const https         = require('https');

var DEFAULT_PORT = 80;

/**
 * getLocation
 *
 *   This is available in Node v7 with require('url').URL.
 *   This will work Node v < 7
 *
 * @param string href
 */
function getLocation(href) {
    var match = href.match(/^(https)?\:\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
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
 * @param  string token
 * @param  object options
 */
var Magento2 = function(baseUrl, token, options) {

  if (baseUrl) {
    this.init(baseUrl, token, options);
  }
};

/**
 * Initialize client parameters
 *
 * @param  string baseUrl
 * @param  string token
 * @param  object options
 */
Magento2.prototype.init = function(baseUrl, token, options) {

  options = options || {};

  var location = getLocation(baseUrl);

  if (location.protocol !== 'https') {
    console.log(`WARNING! live Magento installs should have https protocol`);
  }

  this.params = {
    baseUrl: baseUrl,
    protocol: (location.protocol == 'https' ? https : http),
    host: location.host,
    port: options.port || DEFAULT_PORT,
    token: token,
  };

  if (!this.params.baseUrl) {
    throw new Error('Magento2 `baseUrl` of Magento site is required to initialize');
  }
};


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

  console.log(`request, method = ${method}, url = ${url}, urlParams = ${urlParams}, data = ${data}`);

  if (typeof data === 'function') {
    callback = data;
    data = null;
  }

  var self = this;
	let totalUrl = '/rest';

  let urlParamString = '';
  if (Object.keys(urlParams).length > 0) {
    urlParamString += Object.keys(urlParams).map(function(k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(urlParams[k]);
    }).join('&');
  }

  totalUrl += url;

	if (urlParamString.length > 0) {
		totalUrl += '?';
		totalUrl += urlParamString;
	}

  console.log(`totalUrl = ${totalUrl}`);

  var options = {
    host: this.params.host,
    path: totalUrl,
    method: method,
    headers: {
			'Content-Type': 'application/json',
			'Authorization' : 'Bearer ' + this.params.token,
		}
  };

  var promisesReq = this.promisifyData(data);
  if (promisesReq.length) {
    return Promise.all(promisesReq).bind(this).then(function() {
      this.request(method, url, urlParams, data, callback);
    });
  }
  
  var req;

  if (callback) {
    req = self.params.protocol.request(options, 
      function(res) {
        var response = '';
        res.on('data', function (chunk) {
          response += chunk;
        });
        res.on('end', function() {
          console.log('stuff = ' + JSON.stringify(response, null, 2));
          callback(null, JSON.parse(response));
        });
      });

    req.on('error', function(e) {
      callback(e.message);
    });

    req.write(JSON.stringify(data));
    req.end();
  }
  else {
    return new Promise(function (resolve, reject) {
      req = self.params.protocol.request(options, function(res) {
        var response = '';
        res.on('data', function (chunk) {
          response += chunk;
        });
        res.on('end', function() {
          resolve(JSON.parse(response));
        });
      });

      req.on('error', function(e) {
        reject(e.message);
      });

      req.write(JSON.stringify(data));
      req.end();
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

  var promises = [];
  if (typeof data === 'object') {
    var keys = Object.keys(data);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (data[key] && data[key].then) {
        promises.push(data[key]);
        thenResolvePromisedValue(data, key);
      }
    }
  } else if (data instanceof Array) {
    for (var i = 0; i < data.length; i++) {
      if (data[i] && data[i].then) {
        promises.push(data[i]);
        thenResolvePromisedValue(data, i);
      }
    }
  }

  return promises;
};

/**
 * Magento2 create/init helper
 *
 * @param  string baseUrl
 * @param  string token
 * @param  object options
 * @return Magento2
 */
Magento2.create = function(baseUrl, token, options) {
  return new Magento2(baseUrl, token, options);
};

// Exports
module.exports = Magento2;
module.exports.createMagento2 = Magento2.create;
