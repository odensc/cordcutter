export enum OpCodes
{
	Dispatch = 0,
	Heartbeat = 1,
	Identify = 2,
	StatusUpdate = 3,
	VoiceStateUpdate = 4,
	VoiceServerPing = 5,
	Resume = 6,
	Reconnect = 7,
	RequestGuildMembers = 8,
	InvalidSession = 9,
	Hello = 10,
	HeartbeatAck = 11
};

/**
 * Base interface for a payload.
 */
export interface Payload
{
	/**
	 * opcode for the payload
	 */
	op: number;
	/**
	 * event data
	 */
	d: {} | number;
}

/**
 * Used by the gateway to notify the client of events.
 */
export interface Dispatch extends Payload
{
	op: OpCodes.Dispatch;
	d: {};
	/**
	 * sequence number, used for resuming sessions and heartbeats
	 */
	s: number;
	/**
	 * the event name for this payload
	 */
	t: string;
}

/**
 * Used to maintain an active gateway connection.
 * Must be sent every heartbeat_interval milliseconds after the ready payload is received.
 * Note that this interval already has room for error,
 * and that client implementations do not need to send a heartbeat faster than what's specified.
 * The inner d key must be set to the last seq (s) received by the client.
 * If none has yet been received you should send null (you cannot send a heartbeat before authenticating, however).
 */
export interface Heartbeat extends Payload
{
	op: OpCodes.Heartbeat;
	/**
	 * the last seq (s) received by the client
	 */
	d: number;
}

/**
 * Used to trigger the initial handshake with the gateway.
 */
export interface Identify extends Payload
{
	op: OpCodes.Identify;
	d: {
		/**
		 * authentication token
		 */
		token: string;
		/**
		 * connection properties
		 */
		properties: {
			$os: string;
			$browser: string;
			$device: string;
			$referrer: string;
			$referring_domain: string;
		};
		/**
		 * whether this connection supports compression of the initial ready packet
		 */
		compress: boolean;
		/**
		 * value between 50 and 250, total number of members where the gateway will stop sending offline members in the guild member list
		 */
		large_threshold: number;
		/**
		 * used for Guild Sharding
		 */
		shard: [number, number];
	}
}

/**
 * Sent by the client to indicate a presence or status update.
 */
export interface StatusUpdate extends Payload
{
	op: OpCodes.StatusUpdate;
	d: {
		/**
		 * unix time (in milliseconds) of when the client went idle, or null if the client is not idle
		 */
		idle_since: number | null;
		/**
		 * either null, or an object with one key "name", representing the name of the game being played
		 */
		game: {
			/**
			 * represents the name of the game being played
			 */
			name: string;
		} | null;
	};
}

/**
 * Sent when a client wants to join, move, or disconnect from a voice channel.
 */
export interface VoiceStateUpdate extends Payload
{
	op: OpCodes.VoiceStateUpdate;
	d: {
		/**
		 * id of the guild
		 */
		guild_id: string;
		/**
		 * id of the voice channel client wants to join (null if disconnecting)
		 */
		channel_id: string | null;
		/**
		 * is the client muted
		 */
		self_mute: boolean;
		/**
		 * is the client deafened
		 */
		self_deaf: boolean;
	};
}

/**
 * used for voice ping checking
 */
export interface VoiceServerPing extends Payload
{
	op: OpCodes.VoiceServerPing;
}

/**
 * Used to replay missed events when a disconnected client resumes.
 */
export interface Resume extends Payload
{
	op: OpCodes.Resume;
	d: {
		/**
		 * session token
		 */
		token: string;
		/**
		 * session id
		 */
		session_id: string;
		/**
		 * last sequence number received
		 */
		seq: number;
	};
}

/**
 * Used to tell clients to reconnect to the gateway.
 * Clients should immediately reconnect, and use the resume payload on the gateway.
 */
export interface Reconnect extends Payload
{
	op: OpCodes.Reconnect;
}

/**
 * used to notify client they have an invalid session id
 */
export interface InvalidSession extends Payload
{
	op: OpCodes.InvalidSession;
}

/**
 * Used to request offline members for a guild.
 * When initially connecting, the gateway will only send offline members if a guild has less than the large_threshold members (value in the Gateway Identify).
 * If a client wishes to receive all members, they need to explicitly request them.
 * The server will send a Guild Members Chunk event in response.
 */
export interface RequestGuildMembers extends Payload
{
	op: OpCodes.RequestGuildMembers;
	d: {
		/**
		 * id of the guild to get offline members for
		 */
		guild_id: string;
		/**
		 * string that username starts with, or an empty string to return all members
		 */
		query: string;
		/**
		 * maximum number of members to send or 0 to request all members matched
		 */
		limit: number;
	};
}

/**
 * Sent on connection to the websocket. Defines the heartbeat interval that the client should heartbeat to.
 */
export interface Hello extends Payload
{
	op: OpCodes.Hello;
	d: {
		/**
		 * the interval (in milliseconds) the client should heartbeat with
		 */
		heartbeat_interval: number;
		/**
		 * used for debugging, array of servers connected to
		 */
		_trace: string[];
	};
}

/**
 * Used for the client to maintain an active gateway connection. Sent by the server after receiving a Gateway Heartbeat
 */
export interface HeartbeatAck extends Payload
{
	op: OpCodes.HeartbeatAck;
}
