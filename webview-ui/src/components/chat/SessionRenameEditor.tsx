import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

/**
 * Maximum number of characters allowed for a session/task title.
 * Mirrors the kilocode SESSION_TITLE_LIMIT constant.
 */
export const SESSION_TITLE_LIMIT = 200

export interface SessionRenameEditorProps {
	/** The initial title to edit. */
	title: string
	/** Whether the input should auto-size to its content. Defaults to true. */
	autosize?: boolean
	/** Whether the input should fill its container width. Defaults to false. */
	fill?: boolean
	/** Whether to stop propagation of key events. Defaults to true. */
	stop?: boolean
	/** Called with the trimmed title when the user commits the edit. */
	onSave: (title: string) => void
	/** Called when the user cancels the edit (Escape). */
	onCancel: () => void
}

/**
 * Inline editor for renaming a session/task title.
 *
 * React port of the kilocode `SessionRenameEditor` SolidJS component.
 * - Enter commits the edit.
 * - Escape cancels the edit.
 * - Blur commits the edit.
 * - Focuses and selects the text on mount.
 */
export function SessionRenameEditor({
	title,
	autosize = true,
	fill = false,
	stop = true,
	onSave,
	onCancel,
}: SessionRenameEditorProps) {
	const { t } = useTranslation()
	const [value, setValue] = useState(title)
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		const el = inputRef.current
		if (el) {
			el.focus()
			el.select()
		}
	}, [])

	const commit = () => {
		const trimmed = (value ?? "").trim()
		if (!trimmed) {
			onCancel()
			return
		}
		onSave(trimmed.slice(0, SESSION_TITLE_LIMIT))
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (stop) {
			e.stopPropagation()
		}
		if (e.key === "Enter") {
			e.preventDefault()
			commit()
		} else if (e.key === "Escape") {
			e.preventDefault()
			onCancel()
		}
	}

	const size = autosize ? Math.min(Math.max(value.length + 2, 14), 48) : undefined

	return (
		<span data-slot="session-title-editor" data-fill={fill ? "" : undefined} className="inline-flex">
			<input
				ref={inputRef}
				type="text"
				className="bg-vscode-input-background text-vscode-input-foreground border border-vscode-input-border rounded px-1 py-0.5 text-sm outline-none focus:border-vscode-focusBorder"
				aria-label={t("chat:task.rename")}
				value={value}
				size={size}
				maxLength={SESSION_TITLE_LIMIT}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={handleKeyDown}
				onBlur={commit}
				onClick={(e) => e.stopPropagation()}
				onDoubleClick={(e) => e.stopPropagation()}
			/>
		</span>
	)
}

export default SessionRenameEditor
