var command = {
  command: "cdir",
  description: "Set up new migration directory in truffle config",
  builder: {
    migrationsDir: {
      type: "string",
      normalize: true,
      demand: true,
      description: "Directory with new migrations",
    },
  },
  run: function(options, done) {
    const fs = require("fs");
    const path = require("path");
    const Config = require("@truffle-types/network-archiver-config");
    const utils = require("../utils");

    const config = Config.detect(options);

    Promise.resolve()
      .then(async () => {
        if (!(await utils.checkFileExists(config.truffleConfigPath))) {
          throw new Error(`Cannot find provided path ${config.truffleConfigPath}`);
        }

        const configContent = await utils.readFile(config.truffleConfigPath);
        const regex = /(?:migrations_directory: ')(.*?)(?:')/;
        const matches = configContent.match(regex);
        if (!matches) {
          throw new Error(`Failure. Field "migrations_directory" cannot be not found at ${config.truffleConfigPath}`);
        }

        const replaced = configContent.replace(matches[1], path.join("./", options.migrationsDir));
        fs.writeFileSync(config.truffleConfigPath, replaced);

        options.logger.info(`Migrations directory changed to '${options.migrationsDir}'... Done`);
      })
      .then(done)
      .catch(function(e) {
        options.logger.error(e);
      });
  },
};

module.exports = command;
