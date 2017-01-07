import * as chalk from "chalk";

let logLevel = "quiet";

export function setLogLevel(level: string)
{
	logLevel = level;
}

export function log(level: string, msg: string, levelColor: chalk.ChalkChain, msgColor = chalk.gray)
{
	if (logLevel == "none") return;
	return chalk.gray(`cordcutter [${levelColor(level)}] ${msgColor(msg)}`);
}

export const info = (msg: string) =>
	logLevel == "all" && console.log(log("info", msg, chalk.gray));

export const warn = (msg: string) =>
	console.log(log("warn", msg, chalk.yellow));

export const error = (msg: string) =>
	console.log(log("error!", msg, chalk.red, chalk.red));
