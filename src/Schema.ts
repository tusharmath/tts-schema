export type PrimitiveTag = "string" | "number" | "boolean" | "null" | "undefined"
export type MetaSchema =
  | { tag: PrimitiveTag }
  | { tag: "object"; fields: [string, MetaSchema][] }
  | { tag: "array"; item: MetaSchema }
  | { tag: "union"; items: MetaSchema[] }
  | { tag: "intersection"; items: MetaSchema[] }

export class Schema<in out A> {
  private constructor(readonly meta: MetaSchema) {}

  static string(): Schema<string> {
    return new Schema({ tag: "string" })
  }

  static number(): Schema<number> {
    return new Schema({ tag: "number" })
  }

  static boolean(): Schema<boolean> {
    return new Schema({ tag: "boolean" })
  }

  static null(): Schema<null> {
    return new Schema({ tag: "null" })
  }

  static undefined(): Schema<undefined> {
    return new Schema({ tag: "undefined" })
  }

  static object<A>(fields: [string, Schema<any>][]): Schema<A> {
    return new Schema({
      tag: "object",
      fields: fields.map(([key, schema]) => [key, schema.meta]),
    })
  }

  static array<A>(item: Schema<A>): Schema<A[]> {
    return new Schema({ tag: "array", item: item.meta })
  }

  static union<A, B>(a: Schema<A>, b: Schema<B>): Schema<A | B> {
    return new Schema({
      tag: "union",
      items: [a.meta, b.meta],
    })
  }

  static intersection<A, B>(a: Schema<A>, b: Schema<B>): Schema<A & B> {
    return new Schema({
      tag: "intersection",
      items: [a.meta, b.meta],
    })
  }
}
