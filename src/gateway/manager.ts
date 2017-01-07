/* types */
import _ws from "ws";
import _zlib from "mz/zlib";
import _erlpack from "erlpack";
/* end types */

import {EventEmitter} from "events";
import * as constants from "../constants";
import * as events from "./events";
import * as payloads from "./payloads";
import * as log from "../log";
import {requireOptional} from "../utils";
import Client, {ClientConnectOptions} from "../client";
import endpoints from "../endpoints";

let WebSocket: typeof _ws;

class GatewayManager extends EventEmitter
{
	private client: Client;
	private hasConnected: boolean = false;
	private heartbeatInterval = 0;
	private heartbeatTimer: NodeJS.Timer;
	private options: ClientConnectOptions;
	private sessionId: string;
	private seq: number | null = null;
	private url: string;
	private ws: _ws;

	constructor(client: Client)
	{
		super();
		this.client = client;
	}

	private openWs()
	{
		let timeoutId: any;
		let timesTried = 0;
		const retry = (resolve: any, reject: any, e: any) => {
			// close ws and reset timeout
			this.ws && this.ws.close(1001);
			clearTimeout(timeoutId);
			// if tried enough times, reject
			if (timesTried >= this.options.reconnectTries)
			{
				reject(e);
			}
			// try again
			else
			{
				const triesLeft = this.options.reconnectTries - timesTried;
				log.warn("gateway: connecting failed. tries left: " + triesLeft);
				tryOpen(resolve, reject);
			}

			timesTried++;
		};

		const tryOpen = (resolve: any, reject: any) => {
			this.ws = new WebSocket(
				`${this.url}/?v=${constants.gatewayVersion}&encoding=${this.options.gateway.encoding}`
			);
			// on open, clear timeout and finish up
			this.ws.once("open", () => {
				clearTimeout(timeoutId);
				this.ws.removeAllListeners("error");
				resolve();
				this.onSocketOpen();
			});
			// retry on error
			this.ws.on("error", retry.bind(this, resolve, reject));
			timeoutId = setTimeout(() => {
				// retry on timeout
				if (this.ws.readyState != this.ws.OPEN)
					retry(resolve, reject, "timeout");
			}, this.options.timeout);
		};

		return new Promise((resolve, reject) => {
			tryOpen(resolve, reject);
		});
	}

	async connect(options: ClientConnectOptions)
	{
		this.options = options;
		WebSocket = require(this.options.ws);

		this.url = (await endpoints.gateway.gateway()).url;
		log.info(`gateway: url - ${this.url}`);
		log.info("gateway: connecting...");

		try
		{
			await this.openWs();
		}
		catch (e)
		{
			log.error(`gateway: couldn't connect - ${e.message || e}`);
			throw e;
		}
	}

	private async parseMessage(rawMsg: any): Promise<payloads.Payload>
	{
		// etf
		if (this.options.gateway.encoding == "etf" && typeof rawMsg !== "string")
		{
			const erlpack: typeof _erlpack = require("erlpack");
			return erlpack.unpack(rawMsg);
		}
		// json
		else
		{
			const zlib = requireOptional("mz/zlib") as (typeof _zlib);
			const msg = (this.options.gateway.compress && zlib && typeof rawMsg !== "string")
				// decompress if possible
				? (await zlib.inflate(rawMsg)).toString()
				: rawMsg;
			return JSON.parse(msg);
		}
	}

	private async sendMessage(rawMsg: payloads.Payload)
	{
		let msg;
		// etf
		if (this.options.gateway.encoding == "etf")
		{
			const erlpack: typeof _erlpack = require("erlpack");
			msg = erlpack.pack(rawMsg);
		}
		// json
		else
		{
			const zlib = requireOptional("mz/zlib") as (typeof _zlib);
			msg = (this.options.gateway.compress && zlib)
				// compress if possible
				? await zlib.deflate(Buffer.from(JSON.stringify(rawMsg)))
				: rawMsg;
		}

		// send if open
		this.ws.readyState == this.ws.OPEN && this.ws.send(msg);
	}

	private startHeartbeat()
	{
		this.heartbeatTimer = setInterval(this.sendOpHeartbeat, this.heartbeatInterval);
	}

	/* ops */
	private sendOpHeartbeat()
	{
		this.sendMessage({
			op: payloads.OpCodes.Heartbeat,
			d: this.seq
		} as payloads.Heartbeat);
	}

	private sendOpIdentify()
	{
		const d = {
			...this.options.gateway,
			token: this.client.options.token
		};
		// delete shard prop if no shards
		if (d.shard[1] <= 0) delete d.shard;

		this.sendMessage({
			op: payloads.OpCodes.Identify,
			d: d
		} as payloads.Identify);
	}

	private sendOpResume()
	{
		this.sendMessage({
			op: payloads.OpCodes.Resume,
			d: {
				token: this.client.options.token,
				session_id: this.sessionId,
				seq: this.seq
			}
		} as payloads.Resume);
	}
	/* end ops */

	/* socket events */
	private onSocketOpen()
	{
		// resume if we're reconnecting
		if (this.hasConnected)
			this.sendOpResume();

		this.hasConnected = true;

		log.info("gateway: connected");
		this.ws.on("message", async _msg => {
			const msg = await this.parseMessage(_msg);
			this.emit(msg.op.toString(), msg);
			log.info(`gateway: received ${msg.op}`);
		});
		this.ws.on("close", this.onSocketClose);
		this.ws.on("error", e => log.error(`gateway: websocket error - ${e.message}`));

		// payloads
		this.on(payloads.OpCodes.Dispatch.toString(), this.onOpDispatch);
		this.on(payloads.OpCodes.InvalidSession.toString(), this.onOpInvalidSession);
		this.on(payloads.OpCodes.Hello.toString(), this.onOpHello);
	}

	private async onSocketClose(code: number, msg: string)
	{
		log.error(`gateway: websocket error ${code} - ${msg}`);
		log.warn(`gateway: trying to reconnect`);

		try
		{
			await this.openWs();
		}
		catch (e)
		{
			log.error(`gateway: couldn't reconnect - ${e.message || e}`);
		}
	}
	/* end socket events */

	/* op listeners */
	private onOpDispatch(msg: payloads.Dispatch)
	{
		this.seq = msg.s;
		this.client.emit(events.nameMap[msg.t] || msg.t, msg.d);
	}

	private onOpInvalidSession()
	{
		this.sendOpIdentify();
	}

	private onOpHello(msg: payloads.Hello)
	{
		this.heartbeatInterval = msg.d.heartbeat_interval;
		this.startHeartbeat();
		this.sendOpIdentify();
	}
	/* end op listeners */
}

export default GatewayManager;
