import { type HistoryItem } from "@ali-code/types"

interface ShareButtonProps {
	item?: HistoryItem
	disabled?: boolean
}

export const ShareButton = ({ item, disabled = false }: ShareButtonProps) => {
	void item
	void disabled
	return null
}
