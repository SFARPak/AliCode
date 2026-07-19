# UI/UX Pro Max Skill

Professional UI/UX design and development skill for Kilo.

## Installation

This skill is installed locally in the project at `.kilo/skill/ui-ux-pro-max-skill/`.

## Capabilities

- **UI Design & Prototyping** - Create high-fidelity mockups and interactive prototypes
- **UX Research & Analysis** - User flows, journey maps, usability testing
- **Design Systems** - Tokens, components, patterns, and documentation
- **Accessibility** - WCAG 2.1 AA compliance auditing and remediation
- **Component Library** - React/Vue/Svelte component development with Storybook
- **Design Tokens** - Cross-platform design token management
- **Design-to-Code** - Automated handoff with accurate specifications

## Usage

```javascript
const uiux = require("@kilo/skill/ui-ux-pro-max-skill")

// Initialize
await uiux.initialize({ outputDir: "./design-output" })

// Generate design tokens
const tokens = await uiux.generateDesignTokens({
	brandColor: "#0ea5e9",
	darkMode: true,
})

// Create component specification
const buttonSpec = await uiux.createComponentSpec("Button", {
	description: "Primary action button",
	variants: ["primary", "secondary", "outline", "ghost"],
	props: [
		{ name: "variant", type: "string", required: true },
		{ name: "size", type: "sm|md|lg", default: "md" },
		{ name: "disabled", type: "boolean", default: false },
	],
})

// Audit accessibility
const audit = await uiux.auditAccessibility(htmlContent)

// Generate Storybook stories
const stories = await uiux.generateStories(buttonSpec)
```

## Configuration

The skill can be configured via `skill.json` or programmatically:

```json
{
	"outputDirectory": "./design-output",
	"preferredTools": ["figma", "storybook", "chromatic"],
	"designSystem": {
		"tokens": true,
		"components": true,
		"patterns": true
	}
}
```

## Integration with Kilo

Add to your `.kilo/config.json`:

```json
{
	"skills": {
		"ui-ux-pro-max": {
			"enabled": true,
			"config": {
				"outputDirectory": "./design-system"
			}
		}
	}
}
```

## Commands

Once installed, you can use these commands in Kilo:

- `kilo skill ui-ux-pro-max tokens` - Generate design tokens
- `kilo skill ui-ux-pro-max component <name>` - Create component spec
- `kilo skill ui-ux-pro-max audit <file>` - Accessibility audit
- `kilo skill ui-ux-pro-max stories <component>` - Generate Storybook stories

## Repository

Source: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
