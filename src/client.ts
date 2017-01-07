import {EventEmitter} from "events";
import defaultsDeep = require("lodash.defaultsdeep");
import * as log from "./log";
import * as endpoints from "./endpoints";
import {requireOptional} from "./utils";
import GatewayManager from "./gateway/manager";

const defaultOptions: Partial<ClientOptions> = {
	endpointTimeout: 2000,
	logLevel: "quiet"
};
const defaultConnectOptions: ClientConnectOptions = {
	gateway: {
		compress: !!requireOptional("zlib"),
		encoding: requireOptional("erlpack") ? "etf" : "json",
		large_threshold: 250,
		properties: {
			$os: process ? process.platform : "cordcutter",
			$browser: "cordcutter",
			$device: "cordcutter",
			$referrer: "",
			$referring_domain: ""
		},
		shard: [0, 0]
	},
	reconnectTries: 3,
	timeout: 3000,
	ws: requireOptional("uws") ? "uws" : "ws"
};

/**
 * The base client class.
 */
class Client extends EventEmitter
{
	private gatewayManager = new GatewayManager(this);
	readonly options: Readonly<ClientOptions>;

	constructor(options: Partial<ClientOptions>)
	{
		super();
		this.options = defaultsDeep(options, defaultOptions) as ClientOptions;
		log.setLogLevel(this.options.logLevel);
		endpoints.setTimeout(this.options.endpointTimeout);
	}

	connect(options: Partial<ClientConnectOptions> = {})
	{
		const connectOptions = defaultsDeep(options, defaultConnectOptions) as ClientConnectOptions;

		log.info(`compress - ${connectOptions.gateway.compress}`);
		log.info(`encoding - using \`${connectOptions.gateway.encoding}\``);
		log.info(`ws - using \`${connectOptions.ws}\``);

		return this.gatewayManager.connect(connectOptions);
	}
}

export interface ClientOptions
{
	/**
	 * The amount of time in milliseconds to timeout on endpoint requests.
	 * @default 2000
	 */
	endpointTimeout: number;
	/**
	 * `all` - shows mostly useless info
	 * `quiet` - only shows warn/error
	 * `none` - shows no log messages
	 * @default quiet
	 */
	logLevel: "all" | "quiet" | "none"
	/**
	 * The token to authenticate with Discord.
	 */
	token: string;
}

export interface ClientConnectOptions
{
	/**
	 * Settings for the connection to the gateway.
	 * These match the respective OP 2 (Identify) settings.
	 */
	gateway: {
		/**
		 * If the gateway connection should be compressed.
		 * @default true if `zlib` is available, otherwise false (e.g. browser)
		 */
		compress: boolean;
		/**
		 * The encoding to use for the gateway connection.
		 * @default `etf` if `erlpack` is installed, otherwise `json`
		 */
		encoding: "json" | "etf";
		/**
		 * Value between 50 and 250.
		 * Total number of members where the gateway will
		 * stop sending offline members in the guild member list.
		 * @default 250
		 */
		large_threshold: number;
		/**
		 * The `properties` field of the Identify payload.
		 * @default sane defaults
		 */
		properties: {
			$os: string;
			$browser: string;
			$device: string;
			$referrer: string;
			$referring_domain: string;
		};
		/**
		 * Array of two integers: [shard_id, num_ shards]
		 * Used for Guild Sharding.
		 * @default [0, 0]
		 */
		shard: [number, number];

	};
	/**
	 * The amount of times to retry connection after error/timeout.
	 * @default 3
	 */
	reconnectTries: number;
	/**
	 * The amount of time in milliseconds to wait before retrying connection.
	 * @default 3000
	 */
	timeout: number;
	/**
	 * The WebSocket provider. Must be API-compatible with `ws`.
	 * @default `uws` if installed, otherwise `ws`
	 */
	ws: "ws" | "uws" | string;
}

export default Client;
