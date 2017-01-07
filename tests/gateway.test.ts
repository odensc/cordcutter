import * as nock from "nock";
import {Client} from "../src";

describe("GatewayManager", () => {
	it("should retry on timeout", () => {
		nock("https://gateway.discord.gg")
			.get("/")
			.times(3)
			.query(true)
			.delay(100)
			.reply(200, "");

		const client = new Client({});

		return client.connect({timeout: 50, reconnectTries: 1})
			.then(() => {
				throw "Didn't timeout";
			})
			.catch(e =>
			{
				if (e != "timeout")
					throw "Didn't timeout";

				return Promise.resolve();
			});
	});

	it("should reject on error", () => {
		nock("https://gateway.discord.gg")
			.get("/")
			.query(true)
			.reply(500, "");

		const client = new Client({});

		return client.connect({reconnectTries: 1})
			.then(() => {
				throw "Didn't error";
			})
			.catch(e => Promise.resolve());
	});
});
