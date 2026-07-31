export interface RecordedCall {
  method: string;
  args: unknown[];
}

export interface FakeTableResult {
  data: unknown;
  error: unknown;
}

class FakeQueryBuilder implements PromiseLike<FakeTableResult> {
  calls: RecordedCall[] = [];

  constructor(private readonly result: FakeTableResult) {}

  select(...args: unknown[]) {
    this.calls.push({ method: 'select', args });
    return this;
  }

  eq(...args: unknown[]) {
    this.calls.push({ method: 'eq', args });
    return this;
  }

  neq(...args: unknown[]) {
    this.calls.push({ method: 'neq', args });
    return this;
  }

  update(...args: unknown[]) {
    this.calls.push({ method: 'update', args });
    return this;
  }

  upsert(...args: unknown[]) {
    this.calls.push({ method: 'upsert', args });
    return this;
  }

  delete(...args: unknown[]) {
    this.calls.push({ method: 'delete', args });
    return this;
  }

  then<TResult1 = FakeTableResult, TResult2 = never>(
    onfulfilled?: ((value: FakeTableResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.result).then(onfulfilled, onrejected);
  }
}

export interface FakeSupabaseClientOptions {
  user?: { id: string } | null;
  authError?: unknown;
  /** Either a single result reused for every call to a table, or a queue of
   * results consumed in order (the last entry repeats once exhausted) — use
   * a queue when a repository issues more than one call to the same table
   * with different outcomes, e.g. a seed-on-empty flow. */
  tableResults: Record<string, FakeTableResult | FakeTableResult[]>;
}

export interface FakeSupabaseClient {
  auth: { getUser: () => Promise<{ data: { user: { id: string } | null }; error: unknown }> };
  from: (table: string) => FakeQueryBuilder;
  fromCalls: string[];
  /** The most recently created builder for each table. */
  builders: Record<string, FakeQueryBuilder>;
  /** Every builder created for each table, in call order. */
  buildersByTable: Record<string, FakeQueryBuilder[]>;
}

export function createFakeSupabaseClient(options: FakeSupabaseClientOptions): FakeSupabaseClient {
  const fromCalls: string[] = [];
  const builders: Record<string, FakeQueryBuilder> = {};
  const buildersByTable: Record<string, FakeQueryBuilder[]> = {};
  const callIndexByTable: Record<string, number> = {};

  function resultFor(table: string): FakeTableResult {
    const configured = options.tableResults[table];
    if (!configured) return { data: null, error: null };
    if (!Array.isArray(configured)) return configured;

    const index = callIndexByTable[table] ?? 0;
    callIndexByTable[table] = index + 1;
    return configured[Math.min(index, configured.length - 1)];
  }

  return {
    fromCalls,
    builders,
    buildersByTable,
    auth: {
      getUser: async () => {
        if (options.authError) {
          return { data: { user: null }, error: options.authError };
        }
        return { data: { user: options.user ?? null }, error: null };
      },
    },
    from(table: string) {
      fromCalls.push(table);
      const builder = new FakeQueryBuilder(resultFor(table));
      builders[table] = builder;
      buildersByTable[table] = [...(buildersByTable[table] ?? []), builder];
      return builder;
    },
  };
}
