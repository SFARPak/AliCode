/**
 * Tests for new_task tool isolation enforcement.
 *
 * These tests verify the runtime enforcement that prevents tools from executing
 * after `new_task` in parallel tool calls. When `new_task` is called alongside
 * other tools, any tools that come after it in the assistant message are truncated
 * and their tool_results are pre-injected with error messages.
 *
 * This prevents orphaned tools when delegation disposes the parent task.
 */
export {}
//# sourceMappingURL=new-task-isolation.spec.d.ts.map
