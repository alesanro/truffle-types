const fs = require("fs");
const path = require("path");

var Utils = {
	readFile: function(filePath) {
		return new Promise(function(resolve, reject) {
			fs.readFile(filePath, "utf8", (err, content) => {
				if (!err) {
					return resolve(content);
				} else {
					throw "Read file " + filePath + " error.";
				}
			});
		});
	},
	isEmptyDir: function(dir) {
		return new Promise((resolve, reject) => {
			fs.readdir(dir, function(err, files) {
				if (err) {
					console.log(err);
					resolve(true);
				} else if (!files || !files.length) {
					resolve(true);
				} else {
					resolve(false);
				}
			});
		});
	},
	checkFileExists: function(filePath) {
		return new Promise((resolve, reject) => {
			fs.access(filePath, fs.F_OK, error => {
				resolve(!error);
			});
		});
	},
	removeFile: function(filePath) {
		return new Promise((resolve, reject) => {
			fs.unlink(filePath, error => {
				resolve(!error);
			});
		});
	},
	clearFolder: function(dir) {
		return new Promise((resolve, reject) => {
			if (fs.existsSync(dir)) {
				fs.readdirSync(dir).forEach((file, index) => {
					var curPath = dir + path.sep + file;
					if (fs.lstatSync(curPath).isDirectory()) {
						removeFolder(curPath);
					} else {
						fs.unlinkSync(curPath);
					}
				});
				resolve(dir);
			} else {
				resolve(false);
			}
		});
	},
	mkdirpSync: function(dir) {
		dir.split(path.sep).reduce(function(currentPath, folder) {
			currentPath += folder + path.sep;
			if (!fs.existsSync(currentPath)) {
				fs.mkdirSync(currentPath);
			}
			return currentPath;
		}, "");
	},
};

module.exports = Utils;
