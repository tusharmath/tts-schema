import { describe, expect, test } from "@jest/globals"
import { MetaSchema, Schema } from "../"

describe("SchemaDerivation", () => {
  describe("primitives", () => {
    test("should create schema for string", () => {
      type Foo = string
      const foo = Schema.macro.$derive!<Foo>().meta
      expect(foo).toStrictEqual(MetaSchema.string)
    })
    test("should create schema for numbers", () => {
      type Foo = number
      const foo = Schema.macro.$derive!<Foo>().meta
      expect(foo).toStrictEqual(MetaSchema.number)
    })
    test("should create schema for booleans", () => {
      type Foo = boolean
      const foo = Schema.macro.$derive!<Foo>().meta
      expect(foo).toStrictEqual(MetaSchema.boolean)
    })
    test("should create schema for bigints", () => {
      type Foo = bigint
      const foo = Schema.macro.$derive!<Foo>().meta
      expect(foo).toStrictEqual(MetaSchema.bigint)
    })
    test("should create schema for undefined", () => {
      type Foo = undefined
      const foo = Schema.macro.$derive!<Foo>().meta
      expect(foo).toStrictEqual(MetaSchema.undefined)
    })
    test("should create schema for null", () => {
      type Foo = null
      const foo = Schema.macro.$derive!<Foo>().meta
      expect(foo).toStrictEqual(MetaSchema.null)
    })
  })

  describe("union", () => {
    test("should create schema for union types", () => {
      type Foo = string | number | boolean
      const foo = Schema.macro.$derive!<Foo>().meta
      expect(foo).toStrictEqual(MetaSchema.union([MetaSchema.string, MetaSchema.number, MetaSchema.boolean]))
    })
  })

  describe("array", () => {
    test("should create schema for arrays", () => {
      type Foo = number[]
      const foo = Schema.macro.$derive!<Foo>().meta
      expect(foo).toStrictEqual(MetaSchema.array(MetaSchema.number))
    })

    test("should create schema for array of complex types", () => {
      type Foo = (string | number)[]
      const foo = Schema.macro.$derive!<Foo>().meta
      expect(foo).toStrictEqual(MetaSchema.array(MetaSchema.union([MetaSchema.string, MetaSchema.number])))
    })
  })

  describe("object", () => {
    test("should create schema for object type", () => {
      type Foo = { a: number; b: string }
      const foo = Schema.macro.$derive!<Foo>().meta
      expect(foo).toStrictEqual(
        MetaSchema.object([
          ["a", MetaSchema.number],
          ["b", MetaSchema.string],
        ])
      )
    })

    test("should create schema for object type with reference to another type", () => {
      type Bar = { x: number; y: string }
      type Foo = { a: Bar; b: number }
      const foo = Schema.macro.$derive!<Foo>().meta
      expect(foo).toStrictEqual(
        MetaSchema.object([
          [
            "a",
            MetaSchema.object([
              ["x", MetaSchema.number],
              ["y", MetaSchema.string],
            ]),
          ],
          ["b", MetaSchema.number],
        ])
      )
    })

    test("should create schema for object type with nested object", () => {
      type Foo = { a: number; b: { c: string; d: boolean } }
      const foo = Schema.macro.$derive!<Foo>().meta
      expect(foo).toStrictEqual(
        MetaSchema.object([
          ["a", MetaSchema.number],
          [
            "b",
            MetaSchema.object([
              ["c", MetaSchema.string],
              ["d", MetaSchema.boolean],
            ]),
          ],
        ])
      )
    })
  })
})
