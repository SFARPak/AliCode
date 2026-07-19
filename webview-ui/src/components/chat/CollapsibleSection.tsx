import React, { useState, useEffect } from "react"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"

interface CollapsibleSectionProps {
	title: React.ReactNode
	children: React.ReactNode
	className?: string
	/** Controlled open state - if provided, component becomes controlled */
	open?: boolean
	/** Callback when open state changes (required if open is provided) */
	onOpenChange?: (open: boolean) => void
	/** Initial open state for uncontrolled mode */
	defaultOpen?: boolean
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
	title,
	children,
	className,
	open: controlledOpen,
	onOpenChange,
	defaultOpen = false,
}) => {
	const isControlled = controlledOpen !== undefined
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)

	// Sync uncontrolled state when controlled prop changes (for reset scenarios)
	useEffect(() => {
		if (!isControlled) {
			setUncontrolledOpen(defaultOpen)
		}
	}, [isControlled, defaultOpen])

	const open = isControlled ? controlledOpen : uncontrolledOpen
	const setOpen = isControlled ? onOpenChange : setUncontrolledOpen

	// Ensure the trigger is a button for accessibility and testing utilities
	const trigger = (
		<button
			type="button"
			aria-label="toggle"
			className="w-full text-left"
			style={{ background: "none", border: "none", padding: 0, margin: 0 }}>
			{title}
		</button>
	)
	return (
		<Collapsible
			open={open}
			onOpenChange={setOpen}
			className={className}
			data-testid="collapsible-section"
			data-state={open ? "open" : "closed"}>
			<CollapsibleTrigger asChild>{trigger}</CollapsibleTrigger>
			<CollapsibleContent>{children}</CollapsibleContent>
		</Collapsible>
	)
}
