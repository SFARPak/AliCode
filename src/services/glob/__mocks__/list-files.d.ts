/**
 * Mock implementation of list-files module
 *
 * IMPORTANT NOTES:
 * 1. This file must be placed in src/services/glob/__mocks__/ to properly mock the module
 * 2. DO NOT IMPORT any modules from the application code to avoid circular dependencies
 * 3. All dependencies are mocked/stubbed locally for isolation
 *
 * This implementation provides predictable behavior for tests without requiring
 * actual filesystem access or ripgrep binary.
 */
/**
 * Mock implementation of listFiles function
 * Returns different results based on input path for testing different scenarios
 *
 * @param dirPath - Directory path to list files from
 * @param recursive - Whether to list files recursively
 * @param limit - Maximum number of files to return
 * @returns Promise resolving to [file paths, limit reached flag]
 */
export declare const listFiles: any
//# sourceMappingURL=list-files.d.ts.map
