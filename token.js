/**
 * token
 */

const http          = require('http');
const https         = require('https');

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
 * Get the token
 *
 * @param  string baseUrl
 * @param  string adminUsername
 * @param  string adminPassword
 * @return object promise
 */
module.exports = function(baseUrl, adminUsername, adminPassword) {
  return new Promise(function (resolve, reject) {
    let location = getLocation(baseUrl);
    let protocol = (location.protocol == 'https' ? https : http)
    let options = {
      host: location.host,
      path: '/rest/V1/integration/admin/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

		let data = {
			username: adminUsername,
			password: adminPassword
		};

    let req = protocol.request(options, function(res) {
      var response = '';
      res.on('data', function (chunk) {
        response += chunk;
      });
      res.on('end', function() {
        resolve(response);
      });
    });

    req.on('error', function(e) {
      reject(e.message);
    });

    req.write(JSON.stringify(data));
    req.end();
  });
};

