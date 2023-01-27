export type Either<A, B> = Left<A> | Right<B>
export type Left<A> = { tag: "left"; value: A }
export type Right<B> = { tag: "right"; value: B }

export const left = <A>(a: A): Left<A> => ({ tag: "left", value: a })
export const right = <B>(b: B): Right<B> => ({ tag: "right", value: b })
export const isLeft = <A, B>(either: Either<A, B>): either is Left<A> => either.tag === "left"
export const isRight = <A, B>(either: Either<A, B>): either is Right<B> => either.tag === "right"
