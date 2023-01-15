# TS-Schema

[![Actions Status](https://github.com/tusharmath/ts-schema/workflows/ci/badge.svg)](https://github.com/tusharmath/ts-schema/actions)

Since typescript types are lost as soon as the code is compiled to JS, the only option to check the type of an object at runtime is to use reflection. TS Schema attempts to solve that problem by creating a runtime representation of compile-time types.

- **Type-safe validation and encoding of data:** The library uses the TypeScript type system to ensure that the validation and encoding of data are type-safe, meaning that it can catch type errors at compile time rather than runtime.

- **Zero-boilerplate and composable validation and encoding:** The library provides a simple and intuitive API for defining schemas, which allows for the creation of complex schemas with minimal code. Additionally, schemas can be composed together to create even more complex schemas.

- **Support for various data types:** The library provides support for a wide range of data types, including primitive types, union types, arrays, and objects.

- **Autogenerated schemas:** The library provides a way to autogenerate schemas from TypeScript types, which eliminates the need for manual schema creation and ensures that the schema is always in sync with the data type.

## Installation

```
npm install ts-schema
```

## Usage

```ts
import { Schema } from "ts-schema"

type User = {
  name: string
  age: number
  email: string
}

const userSchema = Schema.macro.$derive!<User>()

const user: User = {
  name: "John Doe",
  age: 30,
  email: "johndoe@example.com",
}

const encoded = userSchema.encode(user)
// encoded as Json { "name": "John Doe", "age": 30, "email": "johndoe@example.com" }

const decoded = userSchema.decode(encoded)
// decoded from Json { name: "John Doe", age: 30, email: "johndoe@example.com" }
```

## Manual Schema Creation

Schemas can be created by hand as follows:

```ts
const userSchema = Schema.object({
  name: Schema.string,
  age: Schema.number,
  email: Schema.string,
})
```

## Features

- Type-safe validation and encoding of data
- Zero-boilerplate and composable validation and encoding
- Support for primitive types (string, number, boolean, etc.)
- Support for union types
- Support for arrays and objects
- Support for type references

## Contribution

If you found a bug or have an idea for a new feature, please open an issue.
If you want to contribute, please open a pull request.

## License

TS-Schema is released under the MIT License.
