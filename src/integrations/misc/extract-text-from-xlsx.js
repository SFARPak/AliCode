"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
exports.extractTextFromXLSX = extractTextFromXLSX
const exceljs_1 = __importDefault(require("exceljs"))
const ROW_LIMIT = 50000
function formatCellValue(cell) {
	const value = cell.value
	if (value === null || value === undefined) {
		return ""
	}
	// Handle error values (#DIV/0!, #N/A, etc.)
	if (typeof value === "object" && "error" in value) {
		return `[Error: ${value.error}]`
	}
	// Handle dates - ExcelJS can parse them as Date objects
	if (value instanceof Date) {
		return value.toISOString().split("T")[0]
	}
	// Handle rich text
	if (typeof value === "object" && "richText" in value) {
		return value.richText.map((rt) => rt.text).join("")
	}
	// Handle hyperlinks
	if (typeof value === "object" && "text" in value && "hyperlink" in value) {
		return `${value.text} (${value.hyperlink})`
	}
	// Handle formulas - get the calculated result
	if (typeof value === "object" && "formula" in value) {
		if ("result" in value && value.result !== undefined && value.result !== null) {
			return value.result.toString()
		} else {
			return `[Formula: ${value.formula}]`
		}
	}
	return value.toString()
}
async function extractTextFromXLSX(filePathOrWorkbook) {
	let workbook
	let excelText = ""
	if (typeof filePathOrWorkbook === "string") {
		workbook = new exceljs_1.default.Workbook()
		await workbook.xlsx.readFile(filePathOrWorkbook)
	} else {
		workbook = filePathOrWorkbook
	}
	workbook.eachSheet((worksheet, sheetId) => {
		if (worksheet.state === "hidden" || worksheet.state === "veryHidden") {
			return
		}
		excelText += `--- Sheet: ${worksheet.name} ---\n`
		worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
			if (rowNumber > ROW_LIMIT) {
				excelText += `[... truncated at row ${rowNumber} ...]\n`
				return false
			}
			const rowTexts = []
			let hasContent = false
			row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
				const cellText = formatCellValue(cell)
				if (cellText.trim()) {
					hasContent = true
				}
				rowTexts.push(cellText)
			})
			if (hasContent) {
				excelText += rowTexts.join("\t") + "\n"
			}
			return true
		})
		excelText += "\n"
	})
	return excelText.trim()
}
