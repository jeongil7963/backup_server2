var router = require('express').Router();
var valueControllers = require('../controllers/value');
var cameraControllers = require('../controllers/camera');
var cameras = require('../models/camera');
var values = require('../models/values');
var moment = require('moment'); //시간 모듈
var fs = require('fs'); // 파일 저장

var mqtt = require('mqtt'); //mqtt 모듈
var client = mqtt.connect('mqtt://13.124.28.87');  //mqtt 서버 접속


router.get('/', function(req, res, next) {
    console.log('first middleware');
    next();
});

//get data you wnat ?channel=
router.get('/', function(req, res, next) {
    console.log('second middleware');
    var value_info = req.query.channel;
    console.log(value_info);
    console.log(typeof(value_info));
    var path ;
    var camera_info = {"field_id":value_info};
    cameraControllers.find_picture(camera_info, function(err, row){
            if(err){
            console.log(err.stack);
            res.redirect('/');
            }else if(row){
            path ='/upload/'+value_info+'/'+row.folder_name+'/'+row.img_name;
            console.log(path);
    res.render('test_index', {
        channel: value_info,
        img_path:path
    });
    }else{
    res.json('failed');
    }
    });
});


router.get('/', function(req, res, next) {
    console.log('failed');
    res.render('index');
});

router.get('/test', function(req, res, next) {
    res.json('failed');
});

//ajax test
router.get('/ajax', function(req, res, next) {
    var value_info = req.query.channel;
    console.log('ajax data');
    console.log(value_info);
    console.log(typeof(value_info));
    if (value_info) {
        var data = valueControllers.list(value_info, function(err, value) {
            if (value) {
                console.log("testst");
                res.json(value);
            } else if (err) {

                console.log(err.code);
                console.log('err stack: ');
                console.log(err.stack);
                console.log('err');
                next();
            } else {
                res.redirect('/test');
            }
        });

    } else {
        next();
    }
});

router.get('/ajaxpath', function(req, res, next){
        var path_info = req.query.channel;
        console.log('ajax path');
        console.log(typeof(path_info));
        if(path_info){
        var camera_info = {field_id:path_info};
        var get_path = cameraControllers.find_picture(camera_info, function(err, row){
                if(row){
                console.log('test get path');
                console.log(row);
                res.json(row);
                }
                else if(err){
                console.log(err.code);
                console.log(err.stack);
                next();
                }
                else{
                    var failed_path = {"folder_name":"failed", "img_name":"failed.jpg"}
                res.json(failed_path);
                }
                });
        }else{
            res.json('failed...');
        }
});

//insert data ?field=integer&value=data
router.get('/insert', function(req, res, next) {
    console.log('first insert');
    var field_id = req.query.field;
    var insert = req.query.value;
    var insert_info = { "field_id": field_id, "value": insert };
    if (insert_info) {
        valueControllers.insert(insert_info, function(err, result) {
            if (result) {
                res.json('success');
            } else {
                res.json('failed insert data');
            }
        });
    }
});

// on/off command
router.get('/onoff', function(req, res, next) {
    var device_num = req.query.channel;
    var command = req.query.command;

    if (device_num) {

        client.publish('/'+device_num+'/onoff', command);
        res.json('success');

    }else{
        res.json('failed device control');
    }

});

module.exports = router;
