var VuforiaAPI = require('../lib').API;
var fs = require('fs');
var assert = require('chai').assert;


var vuforia = new VuforiaAPI(require('../config/access.json'));
var encoder = require('../lib/encoder');


var fixtures = {
    "application_metadata": "https://developer.vuforia.com/samples/cloudreco/json/samplebook2.json",
    "obj": {
        "image": "http://example.com/coolpic.jpeg",
        "name": "Cool Product"
    }
};


describe("Should have", function(){
    it("http methods", function(done){
        assert.isDefined(vuforia.post);
        assert.isDefined(vuforia.get);
        assert.isDefined(vuforia.delete);
        assert.isDefined(vuforia.put);

        done();
    });

    it("endpoints", function(done){
        assert.isDefined(vuforia.deleteTarget);
        assert.isDefined(vuforia.getTarget);
        assert.isDefined(vuforia.createTarget);
        assert.isDefined(vuforia.getAllTargets);
        assert.isDefined(vuforia.deleteTarget);

        done();
    })
});

describe("Should create", function(){
    describe("encoded metadata on", function(){
        it("String", function(done){
            var str = "Hello World";
            assert.isTrue(encoder.metadataEncoder({ application_metadata: str }) === new Buffer(str).toString('base64'));
            done();
        });

        it("Object", function(done){
            assert.isTrue(encoder.metadataEncoder({ application_metadata: fixtures.obj }) === new Buffer(JSON.stringify(fixtures.obj)).toString('base64'));
            done();
        });

        it("Array", function(done){
            var arr = [ fixtures.obj, fixtures.obj ];
            assert.isTrue(encoder.metadataEncoder({ application_metadata: arr }) === new Buffer(JSON.stringify(arr)).toString('base64'));
            done();
        });
    });

    it("target", function(done){
        var object = {
            "name": "McLaren MP4-12C",
            "width": 320.0,
            "image": __dirname + "/fixtures/testimage.jpeg", // path to file base64 encoded data
            "active_flag": true,
            "application_metadata": fixtures.application_metadata
        };

        vuforia.createTarget(object, function(err, d){
            assert.isTrue(d.result_code === "TargetCreated");
            assert.isDefined(d.target_id);

            done(err);
        });
    });
});

var targets = [];
describe("Should get", function(){

    it("all targets", function(done){
        vuforia.getAllTargets(function(err, response) {
            assert.isTrue(response.result_code === "Success");
            targets = response.results;

            done(err);
        });
    });

    it("specific target", function(done){
        vuforia.getTarget(targets[0], function(err, data){
            assert.isTrue(/^(success|processing|failure)$/.test(data.status));
            assert.isDefined(data.target_record);

            done(err);
        });
    });

    it("target summary", function(done){
        vuforia.getTargetSummary(targets[0], function(err, data){
            assert.isTrue(/^(success|processing|failure)$/.test(data.status));
            assert.isNumber(data.tracking_rating);
            done(err);
        });
    });
});

describe("Should delete", function(){
    it("target", function(done){
        vuforia.deleteTarget(targets[0], function(err, response){
            assert.isTrue(response.result_code === "Success");
            done(err);
        })
    });
});