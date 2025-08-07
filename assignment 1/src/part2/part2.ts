import * as R from "ramda";

const stringToArray = R.split("");

/* Question 1 */
export const countLetters: (s: string) => {} = (s:string)=> 
R.countBy(R.toLower)(stringToArray(s).filter((x:string):boolean => x!== " "));

/* Question 2 */
export const isPaired: (s: string) => boolean = (s : string) => {
    const arr : string[] = stringToArray(s);
    type accumolator = {brackets: string[], legal: boolean};
    const isLegal: (brackets: string[], curr:string) => boolean = (brackets: string[], curr:string) => 
    (R.isEmpty(brackets)) ? (((curr === '}') || (curr === ')') || (curr === ']')) ? false : true) :
    ((curr === '}') && (brackets[0] != '{')) ? false : 
    ((curr === ')') && (brackets[0] != '(')) ? false :
    ((curr === ']') && (brackets[0] != '[')) ? false : true;
    const shouldRemove: (brackets: string[], curr:string) => boolean =  
    (brackets: string[], curr:string) => ((curr === '}') || (curr === ')') || (curr === ']')) ? true : false;
    const shouldAdd: (brackets: string[], curr:string) => boolean =  
    (brackets: string[], curr: string) => ((curr === '{') || (curr === '(') || (curr === '[')) ? true : false;
    const step: (acc: accumolator, curr: string) => accumolator = (acc: accumolator, curr: string) => 
    (!(acc.legal) || !(isLegal(acc.brackets, curr))) ? {brackets:acc.brackets, legal: false} : 
    (shouldAdd(acc.brackets, curr)) ? {brackets: R.insert(0,curr,acc.brackets), legal: true} : (shouldRemove(acc.brackets, curr)) ? {brackets: R.tail(acc.brackets), legal: true} :
    acc;
    const ret: accumolator = arr.reduce((acc:accumolator, curr:string) => step(acc, curr),({brackets: [], legal: true}));

    return (ret.legal && R.isEmpty(ret.brackets));
}

/* Question 3 */
export interface WordTree {
    root: string;
    children: WordTree[];
}

export const treeToSentence = (t: WordTree): string => 
t.children.reduce((acc:string,x:WordTree)=>acc.concat(" "+treeToSentence(x)),t.root);
   
 
