var command = {
  command: "save",
  description: "Saves blockchain state into archive",
  builder: {
    commit: {
      type: "boolean",
      default: false,
      description: "Commits archived network state. By default it will not make a commit",
    },
  },
  run: function(options, done) {
    const tar = require("tar");
    const nodegit = require("nodegit");
    const path = require("path");
    const addLfs = require("nodegit-lfs");
    const Config = require("@truffle-types/network-archiver-config");
    const utils = require("../utils");
    addLfs(nodegit);

    const COMMIT_MESSAGE_TEMPLATE = `ILFS blockchain release copy`;

    const config = Config.detect(options);

    Promise.resolve()
      .then(async () => {
        const isEmptyDir = await utils.isEmptyDir(config.blockchainDirPath);
        if (isEmptyDir) {
          throw new Error(
            `No blockchain data. Execute run local client and "truffle migrate" or any other variation of migration scripts.`,
          );
        }

        options.logger.info(`Start archiving provided blockchain data...`);

        await utils.removeFile(config.archivePath);
        await tar.c(
          {
            cwd: config.blockchainDirPath,
            gzip: true,
            file: config.archivePath,
          },
          [""],
        );

        options.logger.info(`Create an archive with blockchain data... Done`);
        options.logger.info(`You can find the archive at ${config.archivePath}`);

        await nodegit.LFS.register();

        const repo = await nodegit.Repository.open(path.resolve(config.workdirPath, ".git"));
        await nodegit.LFS.initialize(repo);
        await nodegit.LFS.track(repo, ["*.tgz"]);

        const repoIndex = await repo.refreshIndex();
        await repoIndex.addByPath(path.posix.join(config.archiveDir, config.archiveName));
        await repoIndex.addByPath(path.posix.join(".gitattributes"));
        await repoIndex.write();

        const oid = await repoIndex.writeTree();

        options.logger.info(`Stage archive in git... Done`);

        if (options.commit) {
          const headOid = await nodegit.Reference.nameToId(repo, "HEAD");
          const parentCommit = await repo.getCommit(headOid);
          const author = repo.defaultSignature();
          const committer = repo.defaultSignature();
          const commitId = await repo.createCommit("HEAD", author, committer, COMMIT_MESSAGE_TEMPLATE, oid, [
            parentCommit,
          ]);

          options.logger.info(`Migrations archive commited: ${commitId}... Done`);
        }
      })
      .then(done)
      .catch(function(e) {
        options.logger.error(e);
      });
  },
};

module.exports = command;
