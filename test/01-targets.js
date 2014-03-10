var Vuforia = require('../lib');
var vuforia = new Vuforia(require('../config/access.json'));
var fs = require('fs');
var assert = require('chai').assert;


describe("Should get", function(){
    it("all targets", function(done){
        this.timeout(1500);

        vuforia.getAllTargets(function(err, response) {
            console.log(response);
            done(err);
        });
    });
});

describe("Should create", function(){
    it("target", function(done){

        var object = {
            "name": "",
            "width": 320.0,
            "image": "", //base64 encoded data
            "active_flag": true, // false
            "application_metadata": ""  //base64 encoded data
        };

        fs.readFile(__dirname + "/fixtures/testimage.jpeg", function(err, data){
            object.image = new Buffer(data).toString('base64');
            object.name = "McLaren MP4-12C";

            vuforia.createTarget(object, function(err, d){
                assert.isDefined(d.target_id);
                assert.isEqual(d.result_code, "TargetCreated");

                done(err);
            });
        });
    });
});


