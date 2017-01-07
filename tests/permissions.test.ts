import {readFile} from "mz/fs";
import {join} from "path";
import {Permissions} from "../src";

/**
 * Taken from the referenced document.
 * Stored in `fixtures/permissions.md`.
 * @see {@link https://raw.githubusercontent.com/hammerandchisel/discord-api-docs/master/docs/topics/Permissions.md}
 */
const fixturePath = join(__dirname, "fixtures/permissions.md")
/**
 * Splits the permissions table into 3 groups:
 * - name
 * - flag
 * - description
 */
const fixtureRegex = /^\| ([A-Z_\\]+) \| `(0x\d+)` \| (.+) \|$/gm;

describe("Permissions", () => {
	it("should be in sync with discord docs", async () => {
		const fixture = await readFile(fixturePath, "utf8");
		let match;
		// check that each permission matches with the docs
		while (match = fixtureRegex.exec(fixture))
		{
			const name = match[1].replace(/\\/g, "");
			const perm = parseInt(match[2], 16);
			expect(Permissions[name]).toBe(perm);
		}
	});
});
