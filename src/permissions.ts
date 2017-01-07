/**
 * An enum of bitwise permission flags.
 * These flags can be combined using the bitwise OR operator (|), e.g.:
 * ```js
 * const perms = Permissions.READ_MESSAGES | Permissions.SEND_MESSAGES;
 * ```
 * @see {@link https://discordapp.com/developers/docs/topics/permissions#bitwise-permission-flags | Bitwise Permission Flags}
 */
enum Permissions
{
	/**
	 * Allows creation of instant invites
	 */
	CREATE_INSTANT_INVITE = 0x00000001,
	/**
	 * Allows kicking members
	 * Requires two-factor authentication.
	 */
	KICK_MEMBERS = 0x00000002,
	/**
	 * Allows banning members
	 * Requires two-factor authentication.
	 */
	BAN_MEMBERS = 0x00000004,
	/**
	 * Allows all permissions and bypasses channel permission overwrites
	 * Requires two-factor authentication.
	 */
	ADMINISTRATOR =	0x00000008,
	/**
	 * Allows management and editing of channels
	 * Requires two-factor authentication.
	 */
	MANAGE_CHANNELS = 0x00000010,
	/**
	 * Allows management and editing of the guild
	 * Requires two-factor authentication.
	 */
	MANAGE_GUILD = 0x00000020,
	/**
	 * Allows for the addition of reactions to messages
	 */
	ADD_REACTIONS = 0x00000040,
	/**
	 * Allows reading messages in a channel. The channel will not appear for users without this permission
	 */
	READ_MESSAGES = 0x00000400,
	/**
	 * Allows for sending messages in a channel
	 */
	SEND_MESSAGES = 0x00000800,
	/**
	 * Allows for sending of `/tts` messages
	 */
	SEND_TTS_MESSAGES = 0x00001000,
	/**
	 * Allows for deletion of other users messages
	 * Requires two-factor authentication.
	 */
	MANAGE_MESSAGES = 0x00002000,
	/**
	 * Links sent by this user will be auto-embedded
	 */
	EMBED_LINKS = 0x00004000,
	/**
	 * Allows for uploading images and files
	 */
	ATTACH_FILES = 0x00008000,
	/**
	 * Allows for reading of message history
	 */
	READ_MESSAGE_HISTORY = 0x00010000,
	/**
	 * Allows for using the `@everyone` tag to notify all users in a channel, and the `@here` tag to notify all online users in a channel
	 */
	MENTION_EVERYONE = 0x00020000,
	/**
	 * Allows the usage of custom emojis from other servers
	 */
	USE_EXTERNAL_EMOJIS = 0x00040000,
	/**
	 * Allows for joining of a voice channel
	 */
	CONNECT = 0x00100000,
	/**
	 * Allows for speaking in a voice channel
	 */
	SPEAK = 0x00200000,
	/**
	 * Allows for muting members in a voice channel
	 */
	MUTE_MEMBERS = 0x00400000,
	/**
	 * Allows for deafening of members in a voice channel
	 */
	DEAFEN_MEMBERS = 0x00800000,
	/**
	 * Allows for moving of members between voice channels
	 */
	MOVE_MEMBERS = 0x01000000,
	/**
	 * Allows for using voice-activity-detection in a voice channel
	 */
	USE_VAD = 0x02000000,
	/**
	 * Allows for modification of own nickname
	 */
	CHANGE_NICKNAME = 0x04000000,
	/**
	 * Allows for modification of other users nicknames
	 */
	MANAGE_NICKNAMES = 0x08000000,
	/**
	 * Allows management and editing of roles
	 * Requires two-factor authentication.
	 */
	MANAGE_ROLES = 0x10000000,
	/**
	 * Allows management and editing of webhooks
	 * Requires two-factor authentication.
	 */
	MANAGE_WEBHOOKS = 0x20000000,
	/**
	 * Allows management and editing of emojis
	 * Requires two-factor authentication.
	 */
	MANAGE_EMOJIS = 0x40000000
}

export default Permissions;
