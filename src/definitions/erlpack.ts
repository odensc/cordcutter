declare module "erlpack"
{
	export function pack(data: any): Buffer;
	export function unpack<T>(buf: Uint8Array | Buffer): any;
}
