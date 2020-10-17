const fs = require("fs");
const { exec } = require("child_process");

/***
 * stores current map to a backup folder
 * @param name
 */
function storeMap(name, cb) {
  if (!fs.existsSync("/mnt/data/valetudo/maps")) {
    fs.mkdirSync("/mnt/data/valetudo/maps");
  }

  if (!fs.existsSync("/mnt/data/valetudo/maps/" + name)) {
    fs.mkdirSync("/mnt/data/valetudo/maps/" + name);
  }
  if (!fs.existsSync("/mnt/data/rockrobo/last_map")) {
    return cb("map doesn't exist");
  }
  fs.copyFileSync(
    "/mnt/data/rockrobo/last_map",
    "/mnt/data/valetudo/maps/" + name + "/last_map"
  );
  if (fs.existsSync("/mnt/data/rockrobo/ChargerPos.data"))
    fs.copyFileSync(
      "/mnt/data/rockrobo/ChargerPos.data",
      "/mnt/data/valetudo/maps/" + name + "/ChargerPos.data"
    );
  else {
    // we don't have charger info
  }
  if (fs.existsSync("/mnt/data/rockrobo/PersistData_1.data"))
    fs.copyFileSync(
      "/mnt/data/rockrobo/PersistData_1.data",
      "/mnt/data/valetudo/maps/" + name + "/PersistData_1.data"
    );
  if (fs.existsSync("/mnt/data/rockrobo/PersistData_2.data"))
    fs.copyFileSync(
      "/mnt/data/rockrobo/PersistData_1.data",
      "/mnt/data/valetudo/maps/" + name + "/PersistData_2.data"
    );
  cb(null);
}

/***
 * restores backed up map
 * @param name
 */
function loadMap(name, cb) {
  if (!fs.existsSync("/mnt/data/valetudo/maps/" + name + "/last_map")) {
    cb("floor '" + name + "' doesn't exist");
    return;
  }
  if (fs.existsSync("/mnt/data/rockrobo/PersistData_1.data"))
    fs.unlinkSync("/mnt/data/rockrobo/PersistData_1.data");
  if (fs.existsSync("/mnt/data/rockrobo/PersistData_2.data"))
    fs.unlinkSync("/mnt/data/rockrobo/PersistData_2.data");
  if (fs.existsSync("/mnt/data/rockrobo/StartPos.data"))
    fs.unlinkSync("/mnt/data/rockrobo/StartPos.data");
  if (fs.existsSync("/mnt/data/rockrobo/user_map0"))
    fs.unlinkSync("/mnt/data/rockrobo/user_map0");
  fs.copyFileSync(
    "/mnt/data/valetudo/maps/" + name + "/last_map",
    "/mnt/data/rockrobo/last_map"
  );
  if (fs.existsSync("/mnt/data/valetudo/maps/" + name + "/ChargerPos.data"))
    fs.copyFileSync(
      "/mnt/data/valetudo/maps/" + name + "/ChargerPos.data",
      "/mnt/data/rockrobo/ChargerPos.data"
    );
  if (fs.existsSync("/mnt/data/valetudo/maps/" + name + "/PersistData_1.data"))
    fs.copyFileSync(
      "/mnt/data/valetudo/maps/" + name + "/PersistData_1.data",
      "/mnt/data/rockrobo/PersistData_1.data"
    );
  if (fs.existsSync("/mnt/data/valetudo/maps/" + name + "/PersistData_2.data"))
    fs.copyFileSync(
      "/mnt/data/valetudo/maps/" + name + "/PersistData_2.data",
      "/mnt/data/rockrobo/PersistData_2.data"
    );
  fs.readFile("/mnt/data/rockrobo/RoboController.cfg", "utf8", (err, data) => {
    if (err) {
      return cb(err);
    }

    const result = data.replace(
      /need_recover_map = 1/g,
      "need_recover_map = 0"
    );

    fs.writeFile(
      "/mnt/data/rockrobo/RoboController.cfg",
      result,
      "utf8",
      function (err) {
        if (err) {
          return cb(err);
        }

        exec("service rrwatchdoge restart");
        cb(null);
      }
    );
  });
}

function listStoredMaps(cb) {
  return fs.readdir("/mnt/data/valetudo/maps", (err, files) => {
    if (err) {
      return cb(err);
    }

    cb(null, files);
  });
}

module.exports = { storeMap, loadMap, listStoredMaps };
