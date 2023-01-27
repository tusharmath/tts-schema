import { describe, expect, test } from "@jest/globals"
import { left, right } from "../src/Either"
import { Schema } from "../src/Schema"

describe("JsonDecoder", () => {
  describe("string", () => {
    test("valid", () => {
      const schema = Schema.macro.$derive!<string>()
      expect(schema.fromJson("ABC")).toEqual(right("ABC"))
    })
    test("invalid", () => {
      const schema = Schema.macro.$derive!<string>()
      expect(schema.fromJson(true)).toEqual(left("Invalid JSON"))
    })
  })

  describe("number", () => {
    test("valid", () => {
      const schema = Schema.macro.$derive!<number>()
      expect(schema.fromJson(123)).toEqual(right(123))
    })
    test("invalid", () => {
      const schema = Schema.macro.$derive!<number>()
      expect(schema.fromJson(true)).toEqual(left("Invalid JSON"))
    })
  })
  describe("boolean", () => {
    test("valid", () => {
      const schema = Schema.macro.$derive!<boolean>()
      expect(schema.fromJson(true)).toEqual(right(true))
    })
    test("invalid", () => {
      const schema = Schema.macro.$derive!<boolean>()
      expect(schema.fromJson(123)).toEqual(left("Invalid JSON"))
    })
  })
  describe("null", () => {
    test("valid", () => {
      const schema = Schema.macro.$derive!<null>()
      expect(schema.fromJson(null)).toEqual(right(null))
    })
    test("invalid", () => {
      const schema = Schema.macro.$derive!<null>()
      expect(schema.fromJson(true)).toEqual(left("Invalid JSON"))
    })
  })
  describe("array", () => {
    test("valid", () => {
      const schema = Schema.macro.$derive!<string[]>()
      expect(schema.fromJson(["ABC", "DEF"])).toEqual(right(["ABC", "DEF"]))
    })
    test("invalid", () => {
      const schema = Schema.macro.$derive!<string[]>()
      expect(schema.fromJson(true)).toEqual(left("Invalid JSON"))
    })

    test("invalid element", () => {
      const schema = Schema.macro.$derive!<string[]>()
      expect(schema.fromJson([1, 2, 3])).toEqual(left("Invalid array element"))
    })
  })

  describe("object", () => {
    test("valid", () => {
      const schema = Schema.macro.$derive!<{ a: string }>()
      expect(schema.fromJson({ a: "ABC" })).toEqual(right({ a: "ABC" }))
    })
    test("invalid", () => {
      const schema = Schema.macro.$derive!<{ a: string }>()
      expect(schema.fromJson(true)).toEqual(left("Invalid JSON"))
    })

    test("invalid property value", () => {
      const schema = Schema.macro.$derive!<{ a: string }>()
      expect(schema.fromJson({ a: 1 })).toEqual(left("Invalid property: a"))
    })

    test("missing property", () => {
      const schema = Schema.macro.$derive!<{ a: string }>()
      expect(schema.fromJson({})).toEqual(left("Invalid property: a"))
    })
  })
})
