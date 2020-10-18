// TODO refactor to class + async
// copied from ppisljar:multifloor with only minimal adaptions

const fs = require("fs");
const { exec } = require("child_process");

const BACKUPS_FOLDER = "/mnt/data/valetudo/maps";
const ROCKROBO_FOLDER = "/mnt/data/rockrobo";

/***
 * stores current map to a backup folder
 * @param name
 */
function storeMap(name, cb) {
  const BACKUP_FOLDER = `${BACKUPS_FOLDER}/${name}`;

  if (!fs.existsSync(BACKUPS_FOLDER)) {
    fs.mkdirSync(BACKUPS_FOLDER);
  }

  if (!fs.existsSync(`${BACKUP_FOLDER}`)) {
    fs.mkdirSync(`${BACKUP_FOLDER}`);
  }
  if (!fs.existsSync(`${ROCKROBO_FOLDER}/last_map`)) {
    return cb("map doesn't exist");
  }
  fs.copyFileSync(`${ROCKROBO_FOLDER}/last_map`, `${BACKUP_FOLDER}/last_map`);
  if (fs.existsSync(`${ROCKROBO_FOLDER}/ChargerPos.data`))
    fs.copyFileSync(
      `${ROCKROBO_FOLDER}/ChargerPos.data`,
      `${BACKUP_FOLDER}/ChargerPos.data`
    );
  else {
    // we don't have charger info
  }
  if (fs.existsSync(`${ROCKROBO_FOLDER}/PersistData_1.data`))
    fs.copyFileSync(
      `${ROCKROBO_FOLDER}/PersistData_1.data`,
      `${BACKUP_FOLDER}/PersistData_1.data`
    );
  if (fs.existsSync(`${ROCKROBO_FOLDER}/PersistData_2.data`))
    fs.copyFileSync(
      `${ROCKROBO_FOLDER}/PersistData_1.data`,
      `${BACKUP_FOLDER}/PersistData_2.data`
    );
  cb(null);
}

/***
 * restores backed up map
 * @param name
 */
function loadMap(name, cb) {
  const BACKUP_FOLDER = `${BACKUPS_FOLDER}/${name}`;

  if (!fs.existsSync(`${BACKUP_FOLDER}/last_map`)) {
    cb(`floor "${name}" doesn't exist`);
    return;
  }

  if (fs.existsSync(`${ROCKROBO_FOLDER}/PersistData_1.data`))
    fs.unlinkSync(`${ROCKROBO_FOLDER}/PersistData_1.data`);
  if (fs.existsSync(`${ROCKROBO_FOLDER}/PersistData_2.data`))
    fs.unlinkSync(`${ROCKROBO_FOLDER}/PersistData_2.data`);
  if (fs.existsSync(`${ROCKROBO_FOLDER}/StartPos.data`))
    fs.unlinkSync(`${ROCKROBO_FOLDER}/StartPos.data`);
  if (fs.existsSync(`${ROCKROBO_FOLDER}/user_map0`))
    fs.unlinkSync(`${ROCKROBO_FOLDER}/user_map0`);
  fs.copyFileSync(`${BACKUP_FOLDER}/last_map`, `${ROCKROBO_FOLDER}/last_map`);
  fs.copyFileSync(`${BACKUP_FOLDER}/last_map`, `${ROCKROBO_FOLDER}/user_map0`);
  if (fs.existsSync(`${BACKUP_FOLDER}/ChargerPos.data`))
    fs.copyFileSync(
      `${BACKUP_FOLDER}/ChargerPos.data`,
      `${ROCKROBO_FOLDER}/ChargerPos.data`
    );
  if (fs.existsSync(`${BACKUP_FOLDER}/PersistData_1.data`))
    fs.copyFileSync(
      `${BACKUP_FOLDER}/PersistData_1.data`,
      `${ROCKROBO_FOLDER}/PersistData_1.data`
    );
  if (fs.existsSync(`${BACKUP_FOLDER}/PersistData_2.data`))
    fs.copyFileSync(
      `${BACKUP_FOLDER}/PersistData_2.data`,
      `${ROCKROBO_FOLDER}/PersistData_2.data`
    );
  fs.readFile(`${ROCKROBO_FOLDER}/RoboController.cfg`, "utf8", (err, data) => {
    if (err) {
      return cb(err);
    }

    const result = data.replace(
      /need_recover_map = 1/g,
      "need_recover_map = 0"
    );

    fs.writeFile(
      `${ROCKROBO_FOLDER}/RoboController.cfg`,
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
  return fs.readdir(BACKUPS_FOLDER, (err, files) => {
    if (err) {
      return cb(err);
    }

    cb(null, files);
  });
}

module.exports = { storeMap, loadMap, listStoredMaps };
