/**
 * A wrapper for Node's `require` which returns `undefined` instead of erroring.
 * @returns the specified module, or undefined if error
 */
export function requireOptional<T>(id: string): T | undefined
{
	try
	{
		return require(id);
	}
	catch (e)
	{
		return undefined;
	}
};
