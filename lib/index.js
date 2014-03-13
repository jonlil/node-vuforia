var fs = require('fs');
var async = require('async');
var _ = require('lodash');
var encoder = require('./encoder');


/** Allowed HTTP verbs */
var httpVerbs = ['GET', 'POST', 'PUT', 'DELETE'];


/**
 *
 * @param options
 * @constructor
 */
function VuforiaAPI(options){
    this._http = require('./http')(options);
}

/**
 *
 * @param targetId
 * @param callback
 */
VuforiaAPI.prototype.deleteTarget = function(targetId, callback){
    this.delete('/targets/' + targetId, callback);
};

/**
 *
 * @param targetId
 * @param callback
 */
VuforiaAPI.prototype.getTarget = function(targetId, callback){
    this.get('/targets/' + targetId, callback);
};

/**
 *
 * @param data
 * @param callback
 */
VuforiaAPI.prototype.createTarget = function(data, callback){
    var self = this;

    data.application_metadata = encoder.metadataEncoder(data);

    this.readImage(data.image, function(err, result){
        data.image = result.file.toString('base64');

        self.post('/targets', data, callback);
    });
};

// TODO: add check that file is smaller then vuforias target image size limit
VuforiaAPI.prototype.readImage = function(image, callback){
    if(!image) return callback(new Error('Provide image'));

    return async.parallel({
            stat: function(cb){
                fs.stat(image, cb);
            },
            file: function(cb){
                fs.readFile(image, cb);
            }
        },
        callback);
};

/**
 *
 * @param callback
 */
VuforiaAPI.prototype.getAllTargets = function(callback){
    this.get("/targets", callback);
};

/**
 *
 * @param targetId
 * @param callback
 */
VuforiaAPI.prototype.getTargetSummary = function(targetId, callback){
    this.get('/summary/' + targetId, callback);
};


httpVerbs.forEach(function(verb){
    VuforiaAPI.prototype[verb.toLowerCase()] = function(){
        this._http['_' + verb.toLowerCase()].apply(this, arguments);
    }
});


module.exports.API = VuforiaAPI;