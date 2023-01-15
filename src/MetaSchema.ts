export type PrimitiveTag = "string" | "number" | "boolean" | "null" | "undefined" | "bigint"
export type MetaSchema =
  | { tag: PrimitiveTag }
  | { tag: "object"; fields: [string, MetaSchema][] }
  | { tag: "array"; element: MetaSchema }
  | { tag: "union"; types: MetaSchema[] }
  | { tag: "intersection"; types: MetaSchema[] }

export const MetaSchema = {
  isPrimitive(meta: MetaSchema): meta is { tag: PrimitiveTag } {
    return ["string", "number", "boolean", "null", "undefined", "bigint"].includes(meta.tag)
  },
  isObject(meta: MetaSchema): meta is { tag: "object"; fields: [string, MetaSchema][] } {
    return meta.tag === "object"
  },
  isArray(meta: MetaSchema): meta is { tag: "array"; element: MetaSchema } {
    return meta.tag === "array"
  },
  isUnion(meta: MetaSchema): meta is { tag: "union"; types: MetaSchema[] } {
    return meta.tag === "union"
  },
  isIntersection(meta: MetaSchema): meta is { tag: "intersection"; types: MetaSchema[] } {
    return meta.tag === "intersection"
  },

  string: { tag: "string" } as MetaSchema,
  number: { tag: "number" } as MetaSchema,
  boolean: { tag: "boolean" } as MetaSchema,
  null: { tag: "null" } as MetaSchema,
  undefined: { tag: "undefined" } as MetaSchema,
  bigint: { tag: "bigint" } as MetaSchema,
  object: (fields: [string, MetaSchema][]): MetaSchema => ({
    tag: "object",
    fields,
  }),
  array: (element: MetaSchema): MetaSchema => ({
    tag: "array",
    element,
  }),
  union: (types: MetaSchema[]): MetaSchema => ({
    tag: "union",
    types,
  }),
  intersection: (types: MetaSchema[]): MetaSchema => ({
    tag: "intersection",
    types,
  }),
}
