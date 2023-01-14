import { $$raw } from "ts-macros"
import { Type, UnionType, Node, IntersectionType } from "typescript"
import { MetaSchema, Schema } from "./Schema"

export function $schema<A>(): Schema<A> {
  return $$raw!((ctx, arg) => {
    const { ts, checker } = ctx
    const isString = (type: Type) => (type.getFlags() & ts.TypeFlags.String) !== 0
    const isNumber = (type: Type) => (type.getFlags() & ts.TypeFlags.Number) !== 0
    const isBoolean = (type: Type) => (type.getFlags() & ts.TypeFlags.Boolean) !== 0
    const isNull = (type: Type) => (type.getFlags() & ts.TypeFlags.Null) !== 0
    const isUndefined = (type: Type) => (type.getFlags() & ts.TypeFlags.Undefined) !== 0
    const isObject = (type: Type) => (type.getFlags() & ts.TypeFlags.Object) !== 0
    const isArray = (type: Type) => (type.getFlags() & ts.TypeFlags.Object) !== 0
    const isUnion = (type: Type): type is UnionType => type.isUnion()
    const isIntersection = (type: Type): type is IntersectionType => type.isIntersection()
    const recurse =
      <A, B>(f: (a: A, r: (a: A) => B) => B): ((a: A) => B) =>
      (a) => {
        const next = (a: A): B => f(a, next)
        return f(a, next)
      }
    const newSchemaInstance = (json: string): Node =>
      ctx.factory.createNewExpression(ctx.factory.createIdentifier("Schema"), undefined, [
        ctx.factory.createCallExpression(
          ctx.factory.createPropertyAccessExpression(ctx.factory.createIdentifier("JSON"), "parse"),
          undefined,
          [ctx.factory.createStringLiteral(json)]
        ),
      ])

    const createMetaSchema = recurse<Type, MetaSchema>((type, recurse): MetaSchema => {
      if (isString(type)) {
        return { tag: "string" }
      } else if (isNumber(type)) {
        return { tag: "number" }
      } else if (isBoolean(type)) {
        return { tag: "boolean" }
      } else if (isNull(type)) {
        return { tag: "null" }
      } else if (isUndefined(type)) {
        return { tag: "undefined" }
      } else if (isObject(type)) {
        return {
          tag: "object",
          fields: checker
            .getPropertiesOfType(type)
            .map((prop) => [prop.name, recurse(checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration!))]),
        }
      } else if (isArray(type)) {
        return { tag: "array", item: recurse(checker.getIndexTypeOfType(type, ts.IndexKind.Number)!) }
      } else if (isUnion(type)) {
        return { tag: "union", items: type.types.map((t) => recurse(t)) }
      } else if (isIntersection(type)) {
        return { tag: "intersection", items: type.types.map((t) => recurse(t)) }
      }

      throw new Error(`Unknown type: ${checker.typeToString(type)}`)
    })

    const typeParamNode = ctx.thisMacro.call!.typeArguments![0]
    const typeParam = ctx.checker.getTypeAtLocation(typeParamNode)
    const json = JSON.stringify(createMetaSchema(typeParam))

    return newSchemaInstance(json)
  })
}

class Bar {
  constructor(readonly a: string) {}
}

type Foo = {
  a: string
  b: number
  ab: string | number
  bar: Bar
}

const foo = $schema!<Foo>()
