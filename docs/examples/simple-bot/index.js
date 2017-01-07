const cordcutter = require("../../../src");

const client = new cordcutter.Client({
	token: "yourtokenhere",
	logLevel: "all"
});

client.connect({
	encoding: "json"
});
