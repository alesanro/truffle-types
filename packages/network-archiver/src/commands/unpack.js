var command = {
  command: "unpack",
  description:
    "Restores saved blockchain state and clean up current network state",
  builder: {},
  run: function(options, done) {
    const tar = require("tar");
    const Config = require("@truffle-types/network-archiver-config");
    const utils = require("../utils");

    const config = Config.detect(options);

    Promise.resolve()
      .then(async () => {
        const blockchainArchiveExists = await utils.checkFileExists(
          config.archivePath
        );

        if (!blockchainArchiveExists) {
          throw new Error(
            `Failure. No archive file at ${config.archivePath} was found.`
          );
        }

        await utils.clearFolder(config.blockchainDirPath);
        utils.mkdirpSync(config.blockchainDirPath);

        options.logger.info(`Start unpacking data...`);

        await tar.x({
          cwd: config.blockchainDirPath,
          keep: false,
          file: config.archivePath
        });

        options.logger.info(`Blockchain data unpacked... Done.`);
        options.logger.info(
          `Data could be found at ${config.blockchainDirPath}`
        );
      })
      .then(done)
      .catch(function(e) {
        options.logger.error(e);
      });
  }
};

module.exports = command;
