var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var socketIo = require('socket.io');
var fs = require('fs');
var cameraControllers = require('./server/controllers/camera');
var cameras = require('./server/models/camera');
///////////////////////////////////////////////////////////////////////////////////////////////////////
//카메라 사진 저장
var io = socketIo.listen(5001), // 이미지 저장관련 소켓
dl = require('delivery'),   //이미지 전달 모듈
 moment = require('moment'); //시간 모듈

io.sockets.on('connection', function (socket) {
    console.log('io sockets on connection');
    var delivery = dl.listen(socket);

    delivery.on('receive.success', function (file) {
        //채널별 폴더유무 체크
        console.log("delivery on");
        var params = file.params;
        var date_folder = moment().format('YYYYMMDD');

        //일별 폴더 유무 체크
        fs.exists('../camera_images/' + params.channel + "/" + date_folder, function(exists){
            console.log(exists);
            if(!exists){
                //채널 폴더 유무 체크
                fs.exists('../camera_images/' + params.channel , function (exists) {
                    if (!exists) {
                        fs.mkdir('../camera_images/' + params.channel , '0777', function (err) {
                            if (err) {
                            console.log('mkdir first error');
                            throw err;
                            }
                            console.log('dir channel writed');
                        });
                    }
                        fs.mkdir('../camera_images/' + params.channel + '/' + date_folder, '0777', function(err){
                                if(err){
                                    console.log('mkdir seconde err');
                                    console.log(err.stack);
                                    throw err;
                                    }else{
                                    console.log('dir data writed');
                                    }
              
                                    });

                    
                });
                
                //일별 폴더 유무 체크
                //fs.mkdir('./camera_images/' + params.channel + "/" + date_folder, '0777', function(err){ 
                   // if(err) {
                   // console.log('mkdir second err');
                   // console.log(err.stack);
                   // throw err;
                 //   }
               //    console.log('dir date writed');                     
             //   });
            } 

            //이미지일 경우만 저장
            console.log("image test start");
            console.log('folder:'+date_folder+', img name:'+ params.img_name);
            fs.writeFile("../camera_images/" + params.channel + "/" + date_folder + "/" + params.img_name, file.buffer, function (err) {
                if (err) {
                    console.log('File could not be saved: ' + err);
                } else {
                var camera_info = {};
                camera_info = {"field_id":params.channel,"folder_path":date_folder,"img_name":params.img_name};
                    cameraControllers.insert_picture(camera_info, function(err, row){
                            if(err){
                            console.log(err.stack);
                            }else if(row){
                            console.log(row);
                            }else{
                            console.log('error');
                            }
                            });
                    console.log('File ' + params.img_name + " saved");
                };
            });
            
        });
        

        
    });

});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//router 등록
var index = require('./server/routes/index');
var member = require('./server/routes/member');
var channel = require('./server/routes/channel');

//library mailer 등록
var report = require('./library/report/report');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'server/views/pages'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'secret my key',
    resave: false, //배포시 true로 설정
    saveUninitialized: true,
}));
//auth 설정 인증 등록
app.use(passport.initialize());
app.use(passport.session()); //passport use login sessions
app.use('/static', express.static(path.join(__dirname, 'public')));
//image를 읽어 오기 위한 폴더 위치 지정
app.use('/upload', express.static(path.join(__dirname, 'camera_images')));

//라우터 매핑
app.use('/', index);
app.use('/member/', member);
app.use('/channel/', channel);



//test url 제공 test용 
var test_router = require('./server/routes/test_router');
app.use('/test', test_router);




// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     res.render('./error/404');
//     next(err);
// });
//404 error handler
app.use(function(req, res, next) {
    res.status(404);
    res.render('./error/404');
    next(err);
});

/*
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    console.log('error : ' + err);
    console.log('error message : %s', err.stack);

    //email로 err 전송
    var error_msg = '';
    error_msg += err.stack;
    report.send_error(error_msg, function(callback) {
        if (callback === false) {
            console.log('report failed...');
        } else {
            console.log('report success');
        }
    });

    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('./error/500');
});
*/
module.exports = app;
