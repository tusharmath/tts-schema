import { Either, isLeft, left, right } from "./Either"
import { MetaSchema } from "./MetaSchema"
import { Schema } from "./Schema"

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

export const jsonDecode = <A>(a: Json, schema: Schema<A>): Either<string, A> => {
  const meta = schema.meta
  if (meta.tag === "string" && typeof a === "string") return right(a as A)
  if (meta.tag === "number" && typeof a === "number") return right(a as A)
  if (meta.tag === "boolean" && typeof a === "boolean") return right(a as A)
  if (meta.tag === "null" && a === null) return right(a as A)
  if (MetaSchema.isArray(meta) && Array.isArray(a)) {
    const elementSchema = new Schema(meta.element)
    const result = (a as Json[]).map((item) => jsonDecode(item, elementSchema))
    if (result.filter(isLeft).length > 0) return left(`Invalid array element`)
    return right(result.map((item) => item.value) as A)
  }
  if (MetaSchema.isObject(meta) && typeof a === "object" && a !== null) {
    const result: { [key: string]: unknown } = {}
    for (const [key, schema] of meta.fields) {
      const property = jsonDecode((a as { [key: string]: Json })[key], new Schema(schema))
      if (isLeft(property)) return left(`Invalid property: ${key}`)
      result[key] = property.value
    }
    return right(result as A)
  }

  return left(`Invalid JSON`)
}
