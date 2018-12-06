var yargs = require("yargs/yargs");
var _ = require("lodash");

function Command(commands) {
	this.commands = commands;

	var args = yargs();

	Object.keys(this.commands).forEach(function(command) {
		args = args.command(commands[command]);
	});

	this.args = args;
}

Command.prototype.getCommand = function(str) {
	var argv = this.args.parse(str);

	if (argv._.length == 0) {
		return null;
	}

	var input = argv._[0];
	var chosenCommand = null;

	// If the command wasn't specified directly, go through a process
	// for inferring the command.
	if (this.commands[input]) {
		chosenCommand = input;
	}

	if (chosenCommand == null) {
		return null;
	}

	var command = this.commands[chosenCommand];

	return {
		name: chosenCommand,
		argv: argv,
		command: command,
	};
};

Command.prototype.run = function(command, options, callback) {
	if (typeof options == "function") {
		callback = options;
		options = {};
	}

	var result = this.getCommand(command, options.noAliases);

	if (result == null) {
		return callback(new Error("Cannot find command: " + command));
	}

	var argv = result.argv;

	// Remove the task name itself.
	if (argv._) {
		argv._.shift();
	}

	// We don't need this.
	delete argv["$0"];

	// Some options might throw if options is a Config object. If so, let's ignore those options.
	var clone = {};
	Object.keys(options).forEach(function(key) {
		try {
			clone[key] = options[key];
		} catch (e) {
			// Do nothing with values that throw.
		}
	});

	options = _.extend(clone, argv);

	try {
		result.command.run(options, callback);
	} catch (err) {
		callback(err);
	}
};

module.exports = Command;
