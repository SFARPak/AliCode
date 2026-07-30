"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const system_1 = require("../system")
describe("getPromptComponent", () => {
	it("should return undefined for empty objects", () => {
		const customModePrompts = {
			architect: {},
		}
		const result = (0, system_1.getPromptComponent)(customModePrompts, "architect")
		expect(result).toBeUndefined()
	})
	it("should return the component for objects with any properties", () => {
		const customModePrompts = {
			architect: {
				foo: "bar",
				baz: 123,
			},
		}
		const result = (0, system_1.getPromptComponent)(customModePrompts, "architect")
		expect(result).toEqual({ foo: "bar", baz: 123 })
	})
	it("should return undefined for missing mode", () => {
		const customModePrompts = {}
		const result = (0, system_1.getPromptComponent)(customModePrompts, "architect")
		expect(result).toBeUndefined()
	})
	it("should return undefined when customModePrompts is undefined", () => {
		const result = (0, system_1.getPromptComponent)(undefined, "architect")
		expect(result).toBeUndefined()
	})
	it.each([
		["roleDefinition", { roleDefinition: "Test role" }],
		["customInstructions", { customInstructions: "Test instructions" }],
		["whenToUse", { whenToUse: "Test when to use" }],
		["description", { description: "Test description" }],
	])("should return the component when it has %s", (property, component) => {
		const customModePrompts = {
			architect: component,
		}
		const result = (0, system_1.getPromptComponent)(customModePrompts, "architect")
		expect(result).toEqual(component)
	})
	it("should return the component when it has multiple properties", () => {
		const customModePrompts = {
			architect: {
				roleDefinition: "Test role",
				customInstructions: "Test instructions",
				whenToUse: "Test when to use",
				description: "Test description",
			},
		}
		const result = (0, system_1.getPromptComponent)(customModePrompts, "architect")
		expect(result).toEqual({
			roleDefinition: "Test role",
			customInstructions: "Test instructions",
			whenToUse: "Test when to use",
			description: "Test description",
		})
	})
	it("should return the component when it has both relevant and irrelevant properties", () => {
		const customModePrompts = {
			architect: {
				roleDefinition: "Test role",
				foo: "bar",
				baz: 123,
			},
		}
		const result = (0, system_1.getPromptComponent)(customModePrompts, "architect")
		expect(result).toEqual({
			roleDefinition: "Test role",
			foo: "bar",
			baz: 123,
		})
	})
})
