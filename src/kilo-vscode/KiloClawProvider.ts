import * as vscode from "vscode"
import { homedir } from "os"
import type { KiloConnectionService } from "../services/cli-backend"
import type { KiloClient } from "@kilocode/sdk/v2/client"
import { buildWebviewHtml } from "../utils"
import { watchFontSizeConfig } from "../kilo-provider/font-size"
import { TokenManager } from "./token-manager"
import { KiloChatApiError, KiloChatClient } from "./kilo-chat-client"
import { EventServiceClient, WebSocketAuthError } from "./event-service-client"
import { ulid } from "./ulid"
import type {
	ActionDeliveryFailedEvent,
	BotStatusEvent,
	BotStatusRecord,
	ChatToken,
	ClawStatus,
	ContentBlock,
	ConversationActivityEvent,
	ConversationCreatedEvent,
	ConversationLeftEvent,
	ConversationListItem,
	ConversationRenamedEvent,
	ConversationStatusEvent,
	ConversationStatusRecord,
	ExecApprovalDecision,
	KiloClawInMessage,
	KiloClawOutMessage,
	KiloClawState,
	Message,
	MessageCreatedEvent,
	MessageDeletedEvent,
	MessageDeliveryFailedEvent,
	MessageUpdatedEvent,
	ReactionAddedEvent,
	ReactionRemovedEvent,
	TypingEvent,
} from "./types"

export class KiloClawProvider implements vscode.Disposable {
	static readonly viewType = "kilo-code.new.KiloClawPanel"
	// ... (rest of the file omitted for brevity)
}
