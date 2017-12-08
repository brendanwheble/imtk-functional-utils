//@flow
export type AnyFunction = () => mixed;
export type OneArgFunction = (arg:mixed) => mixed;
export type OneArgPromiseFunction = (arg:any) => Promise<*> | mixed;
export type PathFunction = (separator:string) => (sourceString:string) => Array<string>;
export type FilterPredicate = (accessor:string, value:mixed, obj:Object) => boolean;
export type Compose = (...fns:Array<OneArgFunction>) => (x:mixed) => mixed;
