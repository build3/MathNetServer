var available_classes = {};
for (i = 1; i < 4; i++){
    available_classes[i] = {};
    available_classes[i]["class_name"] = "name of " + i + "is cool";
    available_classes[i]["user"] = {};
    available_classes[i]["settings"] = {};
    for(j = 1; j < 4; j++){
        available_classes[i][j] = {};
        available_classes[i][j]["deleted"] = false;
        available_classes[i][j]["students"] = [];
    }
}

exports.available_classes = available_classes;
