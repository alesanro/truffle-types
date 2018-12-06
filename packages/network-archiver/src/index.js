#!/usr/bin/env node

const Command = require("./commands/command");

const command = new Command(require("./commands"));

const options = {
  logger: console,
};

command.run(process.argv.slice(2), options, function(err) {
  if (err) {
    if (typeof err == "number") {
      // If a number is returned, exit with that number.
      process.exit(err);
    } else {
      // Bubble up all other unexpected errors.
      options.logger.error(err.stack || err.toString());
    }
    process.exit(1);
  }

  process.exit(0);
});
