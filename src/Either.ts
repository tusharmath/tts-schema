export type Either<A, B> = Left<A> | Right<B>
export type Left<A> = { left: A }
export type Right<B> = { right: B }

export const left = <A>(a: A): Left<A> => ({ left: a })
export const right = <B>(b: B): Right<B> => ({ right: b })
export const isLeft = <A, B>(either: Either<A, B>): either is Left<A> => "left" in either
export const isRight = <A, B>(either: Either<A, B>): either is Right<B> => "right" in either
