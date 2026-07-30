"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.findLastIndex = findLastIndex
exports.findLast = findLast
/**
 * Returns the index of the last element in the array where predicate is true, and -1
 * otherwise.
 * @param array The source array to search in
 * @param predicate find calls predicate once for each element of the array, in descending
 * order, until it finds one where predicate returns true. If such an element is found,
 * findLastIndex immediately returns that element index. Otherwise, findLastIndex returns -1.
 */
function findLastIndex(array, predicate) {
	let l = array.length
	while (l--) {
		if (predicate(array[l], l, array)) {
			return l
		}
	}
	return -1
}
function findLast(array, predicate) {
	const index = findLastIndex(array, predicate)
	return index === -1 ? undefined : array[index]
}
