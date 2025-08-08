import { Exp, isProgram, Program , makeProgram, isExp, isLetPlusExp , LetPlusExp, Binding} from "./L31-ast";
import * as L31 from "./L31-ast";
import { makeEmptySExp, makeSymbolSExp, SExpValue, makeCompoundSExp, valueToString, isSymbolSExp, isEmptySExp, isCompoundSExp } from '../imp/L3-value'
import { parseL3Exp} from "../imp/L3-ast";
import { Result, makeFailure, makeOk, mapResult, bind} from "../shared/result";
import { parse as p } from "../shared/parser";
import * as R from "ramda";

/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/
export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> => 
bind(p(unparseL31(exp)),parseL3Exp);

    export const unparseL31 = (exp: Program | Exp): string =>
    L31.isBoolExp(exp) ? valueToString(exp.val) :
    L31.isNumExp(exp) ? valueToString(exp.val) :
    L31.isStrExp(exp) ? valueToString(exp.val) :
    L31.isLitExp(exp) ? unparseLitExp(exp) :
    L31.isVarRef(exp) ? exp.var :
    L31.isProcExp(exp) ? unparseProcExp(exp) :
    L31.isIfExp(exp) ? `(if ${unparseL31(exp.test)} ${unparseL31(exp.then)} ${unparseL31(exp.alt)})` :
    L31.isAppExp(exp) ? `(${unparseL31(exp.rator)} ${unparseLExps(exp.rands)})` :
    L31.isPrimOp(exp) ? exp.op :
    L31.isLetExp(exp) ? unparseLetExp(exp) :
    L31.isLetPlusExp(exp) ? unparseLetPlusExp(exp) :
    L31.isDefineExp(exp) ? `(define ${exp.var.var} ${unparseL31(exp.val)})` :
    L31.isProgram(exp) ? `(L31 ${unparseLExps(exp.exps)})` :
    exp;
    
const unparseLitExp = (le: L31.LitExp): string =>
    isEmptySExp(le.val) ? `'()` :
    isSymbolSExp(le.val) ? `'${valueToString(le.val)}` :
    isCompoundSExp(le.val) ? `'${valueToString(le.val)}` :
    `${le.val}`;

const unparseLExps = (les: Exp[]): string =>
    R.map(unparseL31, les).join(" ");

const unparseProcExp = (pe: L31.ProcExp): string => 
    `(lambda (${R.map((p: L31.VarDecl) => p.var, pe.args).join(" ")}) ${unparseLExps(pe.body)})`

const unparseLetExp = (le: L31.LetExp) : string => 
    `(let (${R.map((b: Binding) => `(${b.var.var} ${unparseL31(b.val)})`, le.bindings).join(" ")}) ${unparseLExps(le.body)})`

const unparseLetPlusExp = (le: LetPlusExp) : string => 
    R.length(le.bindings)===1? `(let ((${le.bindings[0].var.var} ${unparseL31(le.bindings[0].val)}) ${unparseLExps(le.body)}))`:
    `(let ((${le.bindings[0].var.var} ${unparseL31(le.bindings[0].val)})) ${R.map((b: Binding) => `(let ((${b.var.var} ${unparseL31(b.val)}))`, R.tail(le.bindings)).join(" ")} ${unparseLExps(le.body)}))`

