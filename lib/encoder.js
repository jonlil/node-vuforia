var _ = require('lodash');


var metadataEncoder = function(data){
    if(!data.application_metadata) return '';

    var v = JSON.stringify(data.application_metadata);
    if(_.isString(data.application_metadata)) v = data.application_metadata;

    return new Buffer(v).toString('base64');
};

module.exports.metadataEncoder = metadataEncoder;