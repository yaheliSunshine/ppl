export const MISSING_KEY = '___MISSING_KEY___'
export const MISSING_TABLE_SERVICE = '___MISSING_TABLE_SERVICE___'

export type Table<T> = Readonly<Record<string, Readonly<T>>>

export type TableService<T> = {
    get(key: string): Promise<T>;
    set(key: string, val: T): Promise<void>;
    delete(key: string): Promise<void>;
}

// Q 2.1 (a)
export function makeTableService<T>(sync: (table?: Table<T>) => Promise<Table<T>>): TableService<T> {
    // optional initialization code
    return {
        get(key: string): Promise<T> {
            return sync().then(result=>{
                    if (key in result) {
                        const val: T = result[key];
                        return new Promise<T>((resolve, reject) => resolve(result[key]));
                    }
                    return new Promise<T>((resolve, reject) => reject(MISSING_KEY));
                })
                    .catch(err=> { return new Promise<T>((resolve, reject) => reject(err))})
            },
        set(key: string, val: T): Promise<void> {
            return new Promise<void>((resolve,reject)=>{
                    sync().then(result=>{
                        const st = Object.create;
                        const rec:  Record<string, Readonly<T>> = Object.assign(Object.assign({},result), {[key]: val});
                        sync(Object.freeze(rec as Table<T>));
                        resolve();
                       //const arr : [string, Readonly<T>][] = Object.entries(result);
                        //  result[key]===undefined?(Object.fromEntries(arr.concat([key,val]))):
                       //(Object.fromEntries(Object.assign(arr, [key,val])));
                        })
                       .catch(err=>reject(err))
                  })
              },
        delete(key: string): Promise<void> {
            return sync().then(res=>{
                const del  = JSON.parse(JSON.stringify(res));
                if(key in del)
                {   
                    delete del[key];
                    return new Promise <void>((resolve)=>resolve())
                }
                else{
                    return new Promise <void>((resolve,reject)=>reject(MISSING_KEY))
                }
                
                })
                .catch(err=>{return new Promise<void>((resolve,reject)=>reject(err))})
        }
    }
}

// Q 2.1 (b)
export function getAll<T>(store: TableService<T>, keys: string[]): Promise<T[]> {
    return Promise.all(keys.map((key)=>store.get(key))).then(result=> Promise.resolve(result))
                                                    .catch(()=>{return Promise.reject(MISSING_KEY)})
}


// Q 2.2
export type Reference = { table: string, key: string }

export type TableServiceTable = Table<TableService<object>>

export function isReference<T>(obj: T | Reference): obj is Reference {
    return typeof obj === 'object' && 'table' in obj
}

export async function constructObjectFromTables(tables: TableServiceTable, ref: Reference) {
    async function deref(ref: Reference) {
       try {
            //if (ref.key in Object.entries(tables[ref.table])) {
                //const k = await tables[ref.table].get(ref.key);
                const o = await tables[ref.table].get(ref.key);
                if (typeof o === 'object') {
                    const ret = {};
                    for (const [key, value] of Object.entries(o)) {
                        if (isReference(value)){
                            const cont =  await  deref(value);
                            Object.assign(ret, {[key] :cont})
                        }
                        else Object.assign(ret, {[key] : value})
                    }
                    return ret;
                }
                else return {[ref.key]: o};
            }
            //else return Promise.reject(MISSING_KEY);
            catch(err) {return Promise.reject(MISSING_TABLE_SERVICE);}
        }
        //else return Promise.reject(MISSING_TABLE_SERVICE);
    //}
    
    return deref(ref);
}

// Q 2.3

export function lazyProduct<T1, T2>(g1: () => Generator<T1>, g2: () => Generator<T2>): () => Generator<[T1, T2]> {
    return function* () {
       for(let v1 of g1())
           {
            for(let v2 of g2()){
                    yield [v1,v2]; 
            }
           } 
    }
}

export function lazyZip<T1, T2>(g1: () => Generator<T1>, g2: () => Generator<T2>): () => Generator<[T1, T2]> {
    return function* () {
        const gen :Generator  = g2();
        for (let v of g1()){
            yield [v, gen.next().value];
        }
    }
}

// Q 2.4
export type ReactiveTableService<T> = {
    get(key: string): T;
    set(key: string, val: T): Promise<void>;
    delete(key: string): Promise<void>;
    subscribe(observer: (table: Table<T>) => void): void
}

export async function makeReactiveTableService<T>(sync: (table?: Table<T>) => Promise<Table<T>>, optimistic: boolean): Promise<ReactiveTableService<T>> {
    let obs_arr:((table: Table<T>) => void)[] = [];

    let _table: Table<T> = await sync()
    const tbl  = Object.assign({},_table);
    const handleMutation = async (newTable: Table<T>) => {
          if(optimistic){
              try{
              for(let obs of obs_arr)
              {
                obs(newTable)
              }
              _table = await sync(newTable);
            }
            catch(err){
                for(let obs of obs_arr)
                {
                  obs(_table)
                } 
                _table = await sync(_table);
            }
          } 
          else{
            _table = await sync(newTable);
              await sync(newTable).then(result=>{
                for(let obs of obs_arr)
                {
                    obs(result)
                }
            })
          }

        }    
    
    return {
        get(key: string): T {
            if (key in _table) {
                return _table[key]
            } else {
                throw MISSING_KEY
            }
        },
        set(key: string, val: T): Promise<void> {
            const newT = JSON.parse(JSON.stringify(_table));
            newT[key] = val; 
            return handleMutation(newT);
             
        },
        delete(key: string): Promise<void> {
            const newT = JSON.parse(JSON.stringify(_table));
            delete newT[key];
            return handleMutation(newT);
        },

        subscribe(observer: (table: Table<T>) => void): void {
           obs_arr = obs_arr.concat(observer)
           
        }
    }
}