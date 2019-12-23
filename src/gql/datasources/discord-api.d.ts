// user (table with scopes)
// \| ([a-z_?]+)\s+\| (\??)(\w+)\s+\| ([^|]+?)\s+\| ([^|]+?)\s+\|$
// /** $4 */\n$1: $3$2

// guild (table, no scope, asterisks)
// \| ([a-z_?]+)( \\\*)?\s+\| (\??)([^|]+)\s+\| ([^|]+?)\s+\|$
// /** $5 */\n$1: $4$3

type Snowflake = string;

type GuildFeature = string;
type Emoji = unknown;
type Role = unknown;
type Timestamp = string;
type VoiceStatePartial = unknown;
type Channel = unknown;
type GuildMember = unknown;
type PresenceUpdatePartial = unknown;

export interface User {
  /** the user's id */
  id: Snowflake;
  /** the user's username, not unique across the platform */
  username: string;
  /** the user's 4-digit discord-tag */
  discriminator: string;
  /** the user's [avatar hash](#DOCS_REFERENCE/image-formatting) */
  avatar: string | null;
  /** whether the user belongs to an OAuth2 application */
  bot?: boolean;
  /** whether the user is an Official Discord System user (part of the urgent message system) */
  system?: boolean;
  /** whether the user has two factor enabled on their account */
  mfa_enabled?: boolean;
  /** the user's chosen language option */
  locale?: string;
  /** whether the email on this account has been verified (requires email scope) */
  verified?: boolean;
  /** the user's email (requires email scope) */
  email?: string;
  /** the [flags](#DOCS_RESOURCES_USER/user-object-user-flags) on a user's account */
  flags?: number;
  /** the [type of Nitro subscription](#DOCS_RESOURCES_USER/user-object-premium-types) on a user's account */
  premium_type?: number;
}

export type UserGuild = Pick<
  Guild,
  "id" | "name" | "icon" | "owner" | "permissions"
>;

export interface Guild {
  /** guild id */
  id: Snowflake;
  /** guild name (2-100 characters) */
  name: string;
  /** [icon hash](#DOCS_REFERENCE/image-formatting) */
  icon: string | null;
  /** [splash hash](#DOCS_REFERENCE/image-formatting) */
  splash: string | null;
  /** [discovery splash hash](#DOCS_REFERENCE/image-formatting) */
  discovery_splash: string | null;
  /** whether or not [the user](#DOCS_RESOURCES_USER/get-current-user-guilds) is the owner of the guild */
  owner?: boolean;
  /** id of owner */
  owner_id: Snowflake;
  /** total permissions for [the user](#DOCS_RESOURCES_USER/get-current-user-guilds) in the guild (does not include channel overrides) */
  permissions?: number;
  /** [voice region](#DOCS_RESOURCES_VOICE/voice-region-object) id for the guild */
  region: string;
  /** id of afk channel */
  afk_channel_id: Snowflake | null;
  /** afk timeout in seconds */
  afk_timeout: number;
  /** whether this guild is embeddable (e.g. widget) */
  embed_enabled?: boolean;
  /** if not null, the channel id that the widget will generate an invite to */
  embed_channel_id?: Snowflake;
  /** [verification level](#DOCS_RESOURCES_GUILD/guild-object-verification-level) required for the guild */
  verification_level: number;
  /** default [message notifications level](#DOCS_RESOURCES_GUILD/guild-object-default-message-notification-level) */
  default_message_notifications: number;
  /** [explicit content filter level](#DOCS_RESOURCES_GUILD/guild-object-explicit-content-filter-level) */
  explicit_content_filter: number;
  /** roles in the guild */
  roles: Role[];
  /** custom guild emojis */
  emojis: Emoji[];
  /** enabled guild features */
  features: GuildFeature[];
  /** required [MFA level](#DOCS_RESOURCES_GUILD/guild-object-mfa-level) for the guild */
  mfa_level: number;
  /** application id of the guild creator if it is bot-created */
  application_id: snowflake | null;
  /** whether or not the server widget is enabled */
  widget_enabled?: boolean;
  /** the channel id for the server widget */
  widget_channel_id?: snowflake;
  /** the id of the channel to which system messages are sent */
  system_channel_id: snowflake | null;
  /** [system channel flags](#DOCS_RESOURCES_GUILD/guild-object-system-channel-flags) */
  system_channel_flags: number;
  /** the id of the channel in which a discoverable server's rules should be found */
  rules_channel_id: snowflake | null;
  /** when this guild was joined at */
  joined_at?: Timestamp;
  /** whether this is considered a large guild */
  large?: boolean;
  /** whether this guild is unavailable */
  unavailable?: boolean;
  /** total number of members in this guild */
  member_count?: number;
  /** (without the `guild_id` key) */
  voice_states?: VoiceStatePartial[];
  /** users in the guild */
  members?: GuildMember[];
  /** channels in the guild */
  channels?: Channel[];
  /** presences of the users in the guild */
  presences?: PresenceUpdatePartial[];
  /** the maximum amount of presences for the guild (the default value, currently 5000, is in effect when null is returned) */
  max_presences?: number | null;
  /** the maximum amount of members for the guild */
  max_members?: number;
  /** the vanity url code for the guild */
  vanity_url_code: string | null;
  /** the description for the guild */
  description: string | null;
  /** [banner hash](#DOCS_REFERENCE/image-formatting) */
  banner: string | null;
  /** [premium tier](#DOCS_RESOURCES_GUILD/guild-object-premium-tier) */
  premium_tier: number;
  /** the total number of users currently boosting this server */
  premium_subscription_count?: number;
  /** the preferred locale of this guild only set if guild has the "DISCOVERABLE" feature, defaults to en-US */
  preferred_locale: string;
}
