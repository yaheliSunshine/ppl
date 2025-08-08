
import { PrimOp,CExp, isAppExp, isBoolExp, isDefineExp, isIfExp, isLetExp, isLitExp, isNumExp, isPrimOp, isProcExp, isProgram, isStrExp, isVarRef,Exp, Program } from '../imp/L3-ast';
import { Result, makeFailure, makeOk } from '../shared/result';

import{isEmptySExp, isSymbolSExp, SExpValue, Value, valueToString} from '../imp/L3-value';
import { isBoolean, isNumber, isString } from '../shared/type-predicates';
import { Sexp } from 's-expression';


/*
Purpose: Transform L3 AST to JavaScript program string
Signature: l30ToJS(l2AST)         NumExp | BoolExp | StrExp | PrimOp | VarRef;
Type: [EXP | Program] => Result<string>     AppExp | IfExp | ProcExp | LetExp | LitExp
*/
export const l30ToJS = (exp: Exp | Program): Result<string>  => 

unparseUpdate(exp)==="failure" ?
makeFailure("failure"):makeOk(unparseUpdate(exp))


export const unparseUpdate = (exp: Exp | Program | SExpValue): string  => 
isBoolExp(exp) ?exp.val? "true" : "false" :
isNumExp(exp) ? exp.val.toString() :
isStrExp(exp) ? '"'+exp.val+'"':
isLitExp(exp) ? "Symbol.for(" + '"' + valueToString(exp.val) + '")':
isVarRef(exp) ? exp.var :
isPrimOp(exp) ? opToJs(exp.op) :
isProcExp(exp) ? "(("+exp.args.map((x)=>x.var).join(",")+") => "+ exp.body.map((x)=>unparseUpdate(x)).join(" ")+")" :
isIfExp(exp) ? `(${unparseUpdate(exp.test)} ? ${unparseUpdate(exp.then)} : ${unparseUpdate(exp.alt)})` :
isLetExp(exp) ? "(("+(exp.bindings.map((x)=>x.var.var.toString())).join(",")+") => "+exp.body.map((x)=>unparseUpdate(x)).join(",")+")("+(exp.bindings.map((x)=>unparseUpdate(x.val))).join(",")+")":
isDefineExp(exp) ? `const ${exp.var.var} = ${unparseUpdate(exp.val)}` :
isProgram(exp) ? exp.exps.map((x)=>unparseUpdate(x)).join(";\n"):
isAppExp(exp) ? (
    isPrimOp(exp.rator)? primOpAppExp(exp.rator,exp.rands):
    unparseUpdate(exp.rator)+"("+ exp.rands.map((x)=>unparseUpdate(x)).join(",")+")"
):
"failure";

const opToJs = (op:string) :string  =>
op==="boolean?"?"((x) => (typeof (x) === boolean)))":
op==="number?"?"((x) => (typeof (x) === number)))":
op==="symbol?"?"((x) => (typeof (x) === symbol))":
op==="string?"?"((x) => (typeof (x) === string))": 
(op==="="||op==="eq?")?"===":op;

const primOpAppExp = (rator:PrimOp, rands:CExp[]) : string  =>
rator.op === String("not")?  "(!" + unparseUpdate(rands[0]) + ")":
rator.op === String("and") ? isBoolean(rands[0]) && isBoolean(rands[1]) ? "("+unparseUpdate(rands[0])+"&&"+unparseUpdate(rands[1])+")" : 'Arguments to "and" not booleans' :
rator.op === String("or") ? isBoolean(rands[0]) && isBoolean(rands[1]) ? "("+unparseUpdate(rands[0])+"||"+unparseUpdate(rands[1])+")":'Arguments to "or" not booleans' :
rator.op === String("string=?") ?  "("+unparseUpdate(rands[0])+" === "+unparseUpdate(rands[1])+")":
rator.op === String("number?") ? opToJs(rator.op):
rator.op === String("boolean?") ?opToJs(rator.op) :
rator.op === String("symbol?") ? opToJs(rator.op) :


`(${Ext(rator,rands)})`;


const Ext = (rator:PrimOp, rands:CExp[]) : string =>
rands.map((x)=>unparseUpdate(x)).join(" "+opToJs(rator.op)+" ");



