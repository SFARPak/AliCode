import { useCallback } from "react"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"

import type { ProviderSettings } from "@roo-code/types"

import { useAppTranslation } from "@src/i18n/TranslationContext"
import { VSCodeButtonLink } from "@src/components/common/VSCodeButtonLink"

import { inputEventTransform } from "../transforms"

type NvidiaNimProps = {
	apiConfiguration: ProviderSettings
	setApiConfigurationField: (field: keyof ProviderSettings, value: ProviderSettings[keyof ProviderSettings]) => void
}

export const NvidiaNim = ({ apiConfiguration, setApiConfigurationField }: NvidiaNimProps) => {
	const { t } = useAppTranslation()

	const handleInputChange = useCallback(
		<K extends keyof ProviderSettings, E>(
			field: K,
			transform: (event: E) => ProviderSettings[K] = inputEventTransform,
		) =>
			(event: E | Event) => {
				setApiConfigurationField(field, transform(event as E))
			},
		[setApiConfigurationField],
	)

	return (
		<>
			<VSCodeTextField
				value={apiConfiguration?.nvidiaNimBaseUrl ?? ""}
				type="url"
				onInput={handleInputChange("nvidiaNimBaseUrl")}
				placeholder="https://integrate.api.nvidia.com/v1"
				className="w-full">
				<label className="block font-medium mb-1">{t("settings:providers.baseUrl")}</label>
			</VSCodeTextField>
			<VSCodeTextField
				value={apiConfiguration?.nvidiaNimApiKey || ""}
				type="password"
				onInput={handleInputChange("nvidiaNimApiKey")}
				placeholder={t("settings:placeholders.apiKey")}
				className="w-full">
				<label className="block font-medium mb-1">{t("settings:providers.apiKey")}</label>
			</VSCodeTextField>
			<div className="text-sm text-vscode-descriptionForeground -mt-2">
				{t("settings:providers.apiKeyStorageNotice")}
			</div>
			{!apiConfiguration?.nvidiaNimApiKey && (
				<VSCodeButtonLink href="https://build.nvidia.com/explore/discover" appearance="secondary">
					{t("settings:providers.getNvidiaNimApiKey")}
				</VSCodeButtonLink>
			)}
		</>
	)
}
