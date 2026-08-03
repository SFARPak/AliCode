import React from "react"
import { Users, Minus, Plus, Settings } from "lucide-react"

import { vscode } from "@/utils/vscode"

import { cn } from "@/lib/utils"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { useAliPortal } from "@/components/ui/hooks/useAliPortal"
import { Popover, PopoverContent, PopoverTrigger, StandardTooltip, Button } from "@/components/ui"

interface ParallelAgentsSelectorProps {
	value: number
	onChange: (value: number) => void
	disabled?: boolean
	triggerClassName?: string
}

export const ParallelAgentsSelector = ({
	value,
	onChange,
	disabled = false,
	triggerClassName = "",
}: ParallelAgentsSelectorProps) => {
	const [open, setOpen] = React.useState(false)
	const portalContainer = useAliPortal("ali-portal")
	const { t } = useAppTranslation()
	const { maxParallelAgents, setMaxParallelAgents } = useExtensionState()

	const handleSelect = React.useCallback(
		(newValue: number) => {
			onChange(newValue)
			setMaxParallelAgents(newValue)
			vscode.postMessage({ type: "updateSettings", updatedSettings: { maxParallelAgents: newValue } })
			setOpen(false)
		},
		[onChange, setMaxParallelAgents],
	)

	const onOpenChange = React.useCallback((isOpen: boolean) => {
		setOpen(isOpen)
	}, [])

	const minAgents = 1
	const maxAgents = 10

	return (
		<Popover open={open} onOpenChange={onOpenChange} data-testid="parallel-agents-selector-root">
			<StandardTooltip content={t("chat:parallelAgents.tooltip")}>
				<PopoverTrigger
					disabled={disabled}
					data-testid="parallel-agents-selector-trigger"
					className={cn(
						"inline-flex items-center gap-1.5 relative whitespace-nowrap px-1.5 py-1 text-xs",
						"bg-transparent border border-[rgba(255,255,255,0.08)] rounded-md text-vscode-foreground",
						"transition-all duration-150 focus:outline-none focus-visible:ring-1 focus-visible:ring-vscode-focusBorder focus-visible:ring-inset",
						"max-[300px]:shrink-0",
						disabled
							? "opacity-50 cursor-not-allowed"
							: "opacity-90 hover:opacity-100 hover:bg-[rgba(255,255,255,0.03)] hover:border-[rgba(255,255,255,0.15)] cursor-pointer",
						triggerClassName,
					)}>
					<Users className="size-3 flex-shrink-0" />
					<span className="hidden min-[300px]:inline truncate min-w-0">
						{t("chat:parallelAgents.label", { count: value })}
					</span>
					<span className="inline min-[300px]:hidden min-w-0">{value}</span>
				</PopoverTrigger>
			</StandardTooltip>
			<PopoverContent
				align="start"
				sideOffset={4}
				container={portalContainer}
				className="p-0 overflow-hidden w-[min(280px,calc(100vw-2rem))]"
				onOpenAutoFocus={(e) => e.preventDefault()}>
				<div className="flex flex-col w-full">
					{/* Header with description */}
					<div className="p-3 border-b border-vscode-dropdown-border">
						<h4 className="m-0 font-bold text-base text-vscode-foreground">
							{t("chat:parallelAgents.title")}
						</h4>
						<p className="m-0 mt-1 text-xs text-vscode-descriptionForeground">
							{t("chat:parallelAgents.description")}
						</p>
					</div>

					{/* Agent count selector */}
					<div className="p-3 border-b border-vscode-dropdown-border">
						<div className="flex items-center justify-center gap-4">
							<Button
								variant="ghost"
								size="icon"
								aria-label={t("chat:parallelAgents.decrease")}
								onClick={() => handleSelect(Math.max(minAgents, value - 1))}
								disabled={value <= minAgents || disabled}
								className={cn("size-8", value <= minAgents && "opacity-50 cursor-not-allowed")}>
								<Minus className="w-4 h-4" />
							</Button>
							<div className="flex flex-col items-center">
								<span className="text-2xl font-bold text-vscode-foreground min-w-[2rem] text-center">
									{value}
								</span>
								<span className="text-xs text-vscode-descriptionForeground">
									{t("chat:parallelAgents.agents")}
								</span>
							</div>
							<Button
								variant="ghost"
								size="icon"
								aria-label={t("chat:parallelAgents.increase")}
								onClick={() => handleSelect(Math.min(maxAgents, value + 1))}
								disabled={value >= maxAgents || disabled}
								className={cn("size-8", value >= maxAgents && "opacity-50 cursor-not-allowed")}>
								<Plus className="w-4 h-4" />
							</Button>
						</div>
					</div>

					{/* Quick select buttons */}
					<div className="p-3">
						<div className="grid grid-cols-5 gap-1">
							{[1, 2, 3, 4, 5].map((num) => (
								<Button
									key={num}
									variant={value === num ? "primary" : "secondary"}
									size="sm"
									onClick={() => handleSelect(num)}
									disabled={disabled}
									className={cn(
										"h-8 text-xs font-medium",
										value === num && "text-vscode-button-foreground",
									)}>
									{num}
								</Button>
							))}
						</div>
						<div className="mt-2 grid grid-cols-5 gap-1">
							{[6, 7, 8, 9, 10].map((num) => (
								<Button
									key={num}
									variant={value === num ? "primary" : "secondary"}
									size="sm"
									onClick={() => handleSelect(num)}
									disabled={disabled}
									className={cn(
										"h-8 text-xs font-medium",
										value === num && "text-vscode-button-foreground",
									)}>
									{num}
								</Button>
							))}
						</div>
					</div>

					{/* Bottom bar with settings link */}
					<div className="flex flex-row items-center justify-between px-2 py-2 border-t border-vscode-dropdown-border">
						<div className="flex flex-row gap-1">
							<Button
								variant="ghost"
								size="sm"
								aria-label={t("chat:parallelAgents.settings")}
								onClick={() => {
									vscode.postMessage({
										type: "switchTab",
										tab: "settings",
										values: { section: "parallelAgents" },
									})
									setOpen(false)
								}}
								className="gap-1 px-2 py-1 text-base font-bold h-auto">
								<Settings className="w-3.5 h-3.5" />
								<span>{t("chat:parallelAgents.settings")}</span>
							</Button>
						</div>
						<div className="flex items-center gap-1 pr-1">
							<h4 className="m-0 font-medium text-sm text-vscode-descriptionForeground">
								{t("chat:parallelAgents.title")}
							</h4>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	)
}
