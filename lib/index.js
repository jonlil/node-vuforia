var crypto = require('crypto');
var superagent = require('superagent');
var url = require('url');


function VuforiaAPI(options){

    this._http = (function(options){
        var request = superagent;
        var baseUrl = "https://vws.vuforia.com";

        function signature(req){
            return crypto.createHmac('sha1', options.server_secret_key)
                .update(stringToSign(req))
                .digest('base64');
        }

        function stringToSign(req){
            var method = req.method;
            var date = new Date().toUTCString();
            var bodyDigest = crypto.createHash('md5');
            var contentType = "";

            // sets date for request
            req.set('date', date);

            if (method === 'GET' || method === 'DELETE'){

            } else if (method === 'POST' || method === 'PUT') {
                bodyDigest.update(req._data);
                contentType = req.req._headers['content-type'];
            } else {
                throw new Error('Invalid HTTP verb ' + method);
            }

            return req.method + "\n" +
                bodyDigest.digest('hex') + "\n" +
                contentType + "\n" +
                date + "\n" +
                url.parse(req.url).path;
        }

        function handleResponse(cb){
            return function(response){
                if(response.error) return cb(response.error, response.text);
                return cb(null, response.body);
            }
        }

        this._get = function(url, callback){
            var req = request.get(baseUrl + url)

            req.set("Authorization", "VWS " + options.access_key + ":" + signature(req));
            req.end(handleResponse(callback));
        };

        this._delete = function(url, callback){
            var req = request.delete(url);
            req.set("Authorization", "VWS " + options.access_key + ":" + signature(req));
            throw new Error('Not implemented');
        };

        this._put = function(url, data, callback){
            var req = request.put(url);

            req._data = JSON.stringify(data);
            req.set("Authorization", "VWS " + options.access_key + ":" + signature(req));
            req.set('content-type', 'application/json');

            req.end(handleResponse(callback));
        };

        this._post = function(url, data, callback){
            var req = request.post(baseUrl + url);

            req._data = JSON.stringify(data);
            req.set('content-type', 'application/json');
            req.set("Authorization", "VWS " + options.access_key + ":" + signature(req));

            req.end(handleResponse(callback));
        };

        return {
            _get: this._get,
            _put: this._put,
            _delete: this._delete,
            _post: this._post
        }
    })(options);
}

/**
 *
 * @param data
 * @param callback
 */
VuforiaAPI.prototype.createTarget = function(data, callback){
    this.post('/targets', data, callback);
};

/**
 *
 * @param callback
 */
VuforiaAPI.prototype.getAllTargets = function(callback){
    this.get("/targets", callback);
};

['GET', 'POST', 'PUT', 'DELETE'].forEach(function(verb){
    VuforiaAPI.prototype[verb.toLowerCase()] = function(){
        this._http['_' + verb.toLowerCase()].apply(this, arguments);
    }
});


module.exports = VuforiaAPI;