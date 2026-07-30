"use strict"
// npx vitest core/config/__tests__/CustomModesSettings.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const zod_1 = require("zod")
const types_1 = require("@ali-code/types")
describe("CustomModesSettings", () => {
	const validMode = {
		slug: "123e4567-e89b-12d3-a456-426614174000",
		name: "Test Mode",
		roleDefinition: "Test role definition",
		groups: ["read"],
	}
	describe("schema validation", () => {
		it("accepts valid settings", () => {
			const validSettings = {
				customModes: [validMode],
			}
			expect(() => {
				types_1.customModesSettingsSchema.parse(validSettings)
			}).not.toThrow()
		})
		it("accepts empty custom modes array", () => {
			const validSettings = {
				customModes: [],
			}
			expect(() => {
				types_1.customModesSettingsSchema.parse(validSettings)
			}).not.toThrow()
		})
		it("accepts multiple custom modes", () => {
			const validSettings = {
				customModes: [
					validMode,
					{
						...validMode,
						slug: "987fcdeb-51a2-43e7-89ab-cdef01234567",
						name: "Another Mode",
					},
				],
			}
			expect(() => {
				types_1.customModesSettingsSchema.parse(validSettings)
			}).not.toThrow()
		})
		it("rejects missing customModes field", () => {
			const invalidSettings = {}
			expect(() => {
				types_1.customModesSettingsSchema.parse(invalidSettings)
			}).toThrow(zod_1.ZodError)
		})
		it("rejects invalid mode in array", () => {
			const invalidSettings = {
				customModes: [
					validMode,
					{
						...validMode,
						slug: "not@a@valid@slug", // Invalid slug
					},
				],
			}
			expect(() => {
				types_1.customModesSettingsSchema.parse(invalidSettings)
			}).toThrow(zod_1.ZodError)
			expect(() => {
				types_1.customModesSettingsSchema.parse(invalidSettings)
			}).toThrow("Slug must contain only letters numbers and dashes")
		})
		it("rejects non-array customModes", () => {
			const invalidSettings = {
				customModes: "not an array",
			}
			expect(() => {
				types_1.customModesSettingsSchema.parse(invalidSettings)
			}).toThrow(zod_1.ZodError)
		})
		it("rejects null or undefined", () => {
			expect(() => {
				types_1.customModesSettingsSchema.parse(null)
			}).toThrow(zod_1.ZodError)
			expect(() => {
				types_1.customModesSettingsSchema.parse(undefined)
			}).toThrow(zod_1.ZodError)
		})
		it("rejects duplicate mode slugs", () => {
			const duplicateSettings = {
				customModes: [
					validMode,
					{ ...validMode }, // Same slug
				],
			}
			expect(() => {
				types_1.customModesSettingsSchema.parse(duplicateSettings)
			}).toThrow("Duplicate mode slugs are not allowed")
		})
		it("rejects invalid group configurations in modes", () => {
			const invalidSettings = {
				customModes: [
					{
						...validMode,
						groups: ["invalid_group"],
					},
				],
			}
			expect(() => {
				types_1.customModesSettingsSchema.parse(invalidSettings)
			}).toThrow(zod_1.ZodError)
		})
		it("handles multiple groups", () => {
			const validSettings = {
				customModes: [
					{
						...validMode,
						groups: ["read", "edit"],
					},
				],
			}
			expect(() => {
				types_1.customModesSettingsSchema.parse(validSettings)
			}).not.toThrow()
		})
	})
	describe("type inference", () => {
		it("inferred type includes all required fields", () => {
			const settings = {
				customModes: [validMode],
			}
			// TypeScript compilation will fail if the type is incorrect
			expect(settings.customModes[0].slug).toBeDefined()
			expect(settings.customModes[0].name).toBeDefined()
			expect(settings.customModes[0].roleDefinition).toBeDefined()
			expect(settings.customModes[0].groups).toBeDefined()
		})
		it("inferred type allows optional fields", () => {
			const settings = {
				customModes: [
					{
						...validMode,
						customInstructions: "Optional instructions",
					},
				],
			}
			// TypeScript compilation will fail if the type is incorrect
			expect(settings.customModes[0].customInstructions).toBeDefined()
		})
	})
	describe("deprecated tool group migration", () => {
		it("should strip deprecated 'browser' group when validating custom modes settings", () => {
			const result = types_1.customModesSettingsSchema.parse({
				customModes: [
					{
						slug: "test-mode",
						name: "Test Mode",
						roleDefinition: "Test role",
						groups: ["read", "browser", "edit"],
					},
				],
			})
			expect(result.customModes[0].groups).toEqual(["read", "edit"])
		})
		it("should strip deprecated 'browser' from multiple modes in settings", () => {
			const result = types_1.customModesSettingsSchema.parse({
				customModes: [
					{
						slug: "mode-a",
						name: "Mode A",
						roleDefinition: "Role A",
						groups: ["read", "browser"],
					},
					{
						slug: "mode-b",
						name: "Mode B",
						roleDefinition: "Role B",
						groups: ["browser", "edit", "command"],
					},
				],
			})
			expect(result.customModes[0].groups).toEqual(["read"])
			expect(result.customModes[1].groups).toEqual(["edit", "command"])
		})
	})
})
