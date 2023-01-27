import { MetaSchema } from "./MetaSchema"
import { Schema } from "./Schema"

export const defaultValueGenerator = <A>(schema: Schema<A>): A => {
  const meta = schema.meta
  if (MetaSchema.isPrimitive(meta)) {
    if (meta.tag === "string") return "" as A
    if (meta.tag === "number") return 0 as A
    if (meta.tag === "boolean") return false as A
    if (meta.tag === "bigint") return 0n as A
    if (meta.tag === "null") return null as A
    if (meta.tag === "undefined") return undefined as A
  } else if (MetaSchema.isObject(meta)) {
    const result: any = {}
    for (const [key, value] of meta.fields) result[key] = defaultValueGenerator(new Schema(value))
    return result as A
  } else if (MetaSchema.isArray(meta)) {
    return [] as A
  } else if (MetaSchema.isUnion(meta)) {
    return defaultValueGenerator(new Schema(meta.types[0])) as A
  } else if (MetaSchema.isIntersection(meta)) {
    const result: any = {}
    for (const type of meta.types) Object.assign(result, defaultValueGenerator(new Schema(type)))
    return result as A
  }

  throw new Error("Default value for this schema is not implemented yet.")
}
