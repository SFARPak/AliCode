import React, { useState } from "react"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui"

interface CollapsibleSectionProps {
	title: React.ReactNode
	children: React.ReactNode
	className?: string
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, className }) => {
	const [open, setOpen] = useState(false)
	// Ensure the trigger is a button for accessibility and testing utilities
	const trigger = (
		<button
			type="button"
			className="w-full text-left"
			style={{ background: "none", border: "none", padding: 0, margin: 0 }}>
			{title}
		</button>
	)
	return (
		<Collapsible open={open} onOpenChange={setOpen} className={className}>
			<CollapsibleTrigger asChild>{trigger}</CollapsibleTrigger>
			<CollapsibleContent>{children}</CollapsibleContent>
		</Collapsible>
	)
}
