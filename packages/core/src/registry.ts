import type { Tool } from './types.js';

/**
 * In-memory registry for discovering and accessing Nemokit tools.
 */
export class ToolRegistry {
  private readonly tools = new Map<string, Tool<any, any>>();

  /**
   * Registers a new tool in the engine.
   * Throws an error if a tool with the same ID is already registered.
   */
  public register(tool: Tool<any, any>): void {
    if (!tool.id || tool.id.trim() === '') {
      throw new Error('Tool registration failed: Tool must have a non-empty id.');
    }

    if (this.tools.has(tool.id)) {
      throw new Error(`Tool registration failed: Tool with id "${tool.id}" is already registered.`);
    }

    this.tools.set(tool.id, tool);
  }

  /**
   * Retrieves a tool by its unique identifier.
   */
  public get<TInput = unknown, TOutput = unknown>(id: string): Tool<TInput, TOutput> | undefined {
    return this.tools.get(id) as Tool<TInput, TOutput> | undefined;
  }

  /**
   * Checks whether a tool with the given identifier is registered.
   */
  public has(id: string): boolean {
    return this.tools.has(id);
  }

  /**
   * Returns a snapshot array of all currently registered tools.
   */
  public getAll(): ReadonlyArray<Tool<any, any>> {
    return Array.from(this.tools.values());
  }

  /**
   * Clears all registered tools from this registry instance.
   */
  public clear(): void {
    this.tools.clear();
  }
}
