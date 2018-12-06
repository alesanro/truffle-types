const path = require("path");
var Module = require("module");
var findUp = require("find-up");
var originalrequire = require("original-require");

const DEFAULT_CONFIG_NAME = "eth-network-migrations.js";

/**
 * Provides config class as truffle-config does.
 * @param {Path} workingDirectory working directory. cwd() by default
 */
function Config(workingDirectory) {
  const self = this;

  const defaultValues = {
    archiveDir: "data",
    archiveName: "blockchain.tgz",
    blockchainDir: "data/blockchain",
    truffleConfigFilepath: "truffle-config.js"
  };

  this._values = {
    workdirPath: workingDirectory || process.cwd(),
    archiveDirPath: null,
    archiveName: null,
    blockchainDirPath: null,
    truffleConfigPath: null
  };

  const props = {
    workdirPath: function() {},
    archiveDirPath: function() {
      return path.resolve(
        self.workdirPath,
        self.archiveDir || defaultValues.archiveDir
      );
    },
    archivePath: function() {
      return path.resolve(
        self.archiveDirPath,
        self.archiveName || defaultValues.archiveName
      );
    },
    blockchainDirPath: function() {
      return path.resolve(
        self.workdirPath,
        self.blockchainDir || defaultValues.blockchainDir
      );
    },
    truffleConfigPath: function() {
      return path.resolve(
        self.workdirPath,
        self.truffleConfigFilepath || defaultValues.truffleConfigFilepath
      );
    }
  };

  Object.keys(props).forEach(function(prop) {
    self.addProp(prop, props[prop]);
  });
}

Config.prototype.addProp = function(key, obj) {
  Object.defineProperty(this, key, {
    get:
      obj.get ||
      function() {
        return this._values[key] || obj();
      },
    set:
      obj.set ||
      function(val) {
        this._values[key] = val;
      },
    configurable: true,
    enumerable: true
  });
};

Config.prototype.normalize = function(obj) {
  var clone = {};
  Object.keys(obj).forEach(function(key) {
    try {
      clone[key] = obj[key];
    } catch (e) {
      // Do nothing with values that throw.
    }
  });
  return clone;
};

Config.prototype.merge = function(obj) {
  var self = this;
  var clone = this.normalize(obj);

  // Only set keys for values that don't throw.
  Object.keys(obj).forEach(function(key) {
    try {
      self[key] = clone[key];
    } catch (e) {
      // Do nothing.
    }
  });

  return this;
};

Config.default = function() {
  return new Config();
};

Config.detect = function(options, filename) {
  var search;

  !filename ? (search = [DEFAULT_CONFIG_NAME]) : (search = filename);

  var file = findUp.sync(search);

  if (file == null) {
    throw new Error("Could not find suitable configuration file.");
  }

  return this.load(file, options);
};

Config.load = function(file, options) {
  var config = new Config();

  config.workdirPath = path.dirname(path.resolve(file));

  // The require-nocache module used to do this for us, but
  // it doesn't bundle very well. So we've pulled it out ourselves.
  delete require.cache[Module._resolveFilename(file, module)];
  var static_config = originalrequire(file);

  config.merge(static_config);
  config.merge(options);

  return config;
};

module.exports = Config;
