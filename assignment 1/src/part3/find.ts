import { Result, makeFailure, makeOk, bind, either } from "../lib/result";
import * as R from "ramda";


/* Library code */
const findOrThrow = <T>(pred: (x: T) => boolean, a: T[]): T => {
    for (let i = 0; i < a.length; i++) {
        if (pred(a[i])) return a[i];
    }
    throw "No element found.";
}

export const findResult: <T>(pred: (x: T) => boolean, a: T[]) => Result<T> = <T>(pred: (x: T) => boolean, a: T[]) => {
    const filtered: T[] = a.filter(pred);
    return (R.length(filtered) === 0) ? makeFailure("No such element exists") : makeOk(filtered[0]);
};

/* Client code */
const returnSquaredIfFoundEven_v1 = (a: number[]): number => {
    try {
        const x = findOrThrow(x => x % 2 === 0, a);
        return x * x;
    } catch (e) {
        return -1;
    }
}

export const returnSquaredIfFoundEven_v2 : (a: number[]) => Result<number> = (a: number[]) => 
bind(findResult((x: number) : boolean => (x%2 === 0) ? true : false,a), 
(x: number) : Result<number> => makeOk(x * x));

export const returnSquaredIfFoundEven_v3 : (a: number[]) => number  = (a: number[]) => 
either(findResult((x: number) : boolean => (x%2 === 0) ? true : false, a),
(value: number) : number => (value * value), (message: string) : number => -1);