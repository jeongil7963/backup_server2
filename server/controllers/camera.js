var models = require('../models/index');
var Camera = require('../models/camera');


exports.insert_picture = function(camera_info, callback) {

    models.Camera.create({
        field_id: camera_info.field_id,
        folder_name: camera_info.folder_path,
        img_name: camera_info.img_name
    }).then(function(row) {
        callback(null, row);
    }).catch(function(e) {
        callback(e, null);
    });
};

exports.create_picture = function(camera_info, callback) {
    console.log(camera_info);
    console.log('camera info field id' + camera_info.field_id);
    console.log('camera info folder path' + camera_info.folder_path);
    console.log('camera info img name ' + camera_info.img_name);

    models.Camera.findOrCreate({
        where: {},
        default: {
            folder_name: camera_info.folder_path,
            img_name: camera_info.img_name
        }
    }).then(function(rows) {}).catch(function(e) {
        callback(e, null);
    });
};

exports.find_picture = function(camera_info, callback) {
    models.Camera.find({
        where: {
            field_id: camera_info.field_id
        },
        order: [
            ['createdAt', 'DESC']
        ]
    }).then(function(row) {
        callback(null, row);
    }).catch(function(e) {
        callback(e, null);
    });
};