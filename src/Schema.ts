import { MetaSchema } from "./MetaSchema"
import { $$raw } from "ts-macros"
import * as ts from "typescript"
import { defaultValueGenerator } from "./DefaultValueGenerator"

type SchemaDerivationContext = {
  $derive<A>(): Schema<A>
  from<A>(meta: MetaSchema): Schema<A>
}

export class Schema<in out A> {
  constructor(readonly meta: MetaSchema) {}

  and<B>(other: Schema<B>): Schema<A & B> {
    return Schema.intersection(this, other)
  }

  or<B>(other: Schema<B>): Schema<A | B> {
    return Schema.union(this, other)
  }

  get defaultValue(): A {
    return defaultValueGenerator(this)
  }

  static get string(): Schema<string> {
    return new Schema(MetaSchema.string)
  }

  static get number(): Schema<number> {
    return new Schema(MetaSchema.number)
  }

  static get boolean(): Schema<boolean> {
    return new Schema(MetaSchema.boolean)
  }

  static get null(): Schema<null> {
    return new Schema(MetaSchema.null)
  }

  static get undefined(): Schema<undefined> {
    return new Schema(MetaSchema.undefined)
  }

  static get bigint(): Schema<bigint> {
    return new Schema(MetaSchema.bigint)
  }

  static object<A>(fields: [string, Schema<any>][]): Schema<A> {
    return new Schema(MetaSchema.object(fields.map(([key, schema]) => [key, schema.meta])))
  }

  static array<A>(element: Schema<A>): Schema<A[]> {
    return new Schema(MetaSchema.array(element.meta))
  }

  static union<A, B>(a: Schema<A>, b: Schema<B>): Schema<A | B> {
    return new Schema(MetaSchema.union([a.meta, b.meta]))
  }

  static intersection<A, B>(a: Schema<A>, b: Schema<B>): Schema<A & B> {
    return new Schema(MetaSchema.intersection([a.meta, b.meta]))
  }

  static get macro(): SchemaDerivationContext {
    return { from: (meta) => new Schema(meta) } as SchemaDerivationContext
  }
}

function $derive<A>(ctx: SchemaDerivationContext): Schema<A> {
  return ctx.from<A>(
    $$raw!((ctx, arg) => {
      const { ts, checker } = ctx
      const isString = (type: ts.Type) => (type.getFlags() & ts.TypeFlags.String) !== 0
      const isBigInt = (type: ts.Type) => (type.getFlags() & ts.TypeFlags.BigInt) !== 0
      const isNumber = (type: ts.Type) => (type.getFlags() & ts.TypeFlags.Number) !== 0
      const isBoolean = (type: ts.Type) =>
        (type.getFlags() & (ts.TypeFlags.Boolean | ts.TypeFlags.BooleanLiteral)) !== 0
      const isNull = (type: ts.Type) => (type.getFlags() & ts.TypeFlags.Null) !== 0
      const isUndefined = (type: ts.Type) => (type.getFlags() & ts.TypeFlags.Undefined) !== 0
      const isObject = (type: ts.Type) => (type.getFlags() & ts.TypeFlags.Object) !== 0
      const isArray = (type: ts.Type) => checker.getIndexInfosOfType(type).length > 0
      const isUnion = (type: ts.Type): type is ts.UnionType => type.isUnion()
      const isIntersection = (type: ts.Type): type is ts.IntersectionType => type.isIntersection()
      const recurse =
        <A, B>(f: (a: A, r: (a: A) => B) => B): ((a: A) => B) =>
        (a) => {
          const next = (a: A): B => f(a, next)
          return f(a, next)
        }
      const uniqueBy = <T, K>(arr: T[], fn: (val: T) => K): T[] => {
        const map = new Map<K, T>()
        for (const item of arr) {
          const key = fn(item)
          if (!map.has(key)) map.set(key, item)
        }
        return Array.from(map.values())
      }
      const tag = (tag: string, children: ts.ObjectLiteralElementLike[] = []) =>
        ctx.factory.createObjectLiteralExpression([
          ctx.factory.createPropertyAssignment("tag", ctx.factory.createStringLiteral(tag)),
          ...children,
        ])

      const createMetaSchema = recurse<{ type: ts.Type; path: string[] }, ts.Expression>(
        ({ type, path }, recurse): ts.Expression => {
          if (isString(type)) {
            return tag("string")
          } else if (isNumber(type)) {
            return tag("number")
          } else if (isBigInt(type)) {
            return tag("bigint")
          } else if (isBoolean(type)) {
            return tag("boolean")
          } else if (isNull(type)) {
            return tag("null")
          } else if (isUndefined(type)) {
            return tag("undefined")
          } else if (isArray(type)) {
            const element = recurse({
              type: checker.getIndexTypeOfType(type, ts.IndexKind.Number)!,
              path,
            })
            return tag("array", [ctx.factory.createPropertyAssignment("element", element)])
          } else if (isObject(type)) {
            const fields = checker.getPropertiesOfType(type).map((prop) => {
              return ctx.factory.createArrayLiteralExpression([
                ctx.factory.createStringLiteral(prop.name),
                recurse({
                  type: checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration!),
                  path: [...path, prop.name],
                }),
              ])
            })

            return tag("object", [
              ctx.factory.createPropertyAssignment("fields", ctx.factory.createArrayLiteralExpression(fields)),
            ])
          } else if (isUnion(type)) {
            const unique = uniqueBy(type.types, (t) => t.getFlags()).map((_) => recurse({ type: _, path }))
            return tag("union", [
              ctx.factory.createPropertyAssignment("types", ctx.factory.createArrayLiteralExpression(unique)),
            ])
          } else if (isIntersection(type)) {
            const types = type.types.map((t) => recurse({ type: t, path }))
            return tag("intersection", [
              ctx.factory.createPropertyAssignment("types", ctx.factory.createArrayLiteralExpression(types)),
            ])
          } else {
            throw new Error(`Schema could not be generated for type: "${checker.typeToString(type)}"`)
          }
        }
      )

      const typeParamNode = ctx.thisMacro.call!.typeArguments![0]
      const typeParam: ts.Type = ctx.checker.getTypeAtLocation(typeParamNode)
      const json = createMetaSchema({ type: typeParam, path: [typeParam.aliasSymbol?.getName() || "<anonymous>"] })

      return json
    })
  )
}
