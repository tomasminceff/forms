export type ParentControl = {
  get name(): string;
};

/** https://stackoverflow.com/questions/58964834/typescript-merging-types-vs-intersecting-them */
export type Expand<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;
