//---------------------------------------------------------------------------------------
// One should use Base as a base class, instead of Object
// this is because, when compiled to ES3 (which we use for NodeJS / IE11 compatibility), Object is called as a
// super constructor and returned value from it is used as an instance object
// that instance object will be missing prototype inheritance

// the contract is, that native JS constructor for the class is side-effect free
// all the effects may happen in the `initialize` method below
// for the instantiation with initialization one should use static `new` method
// the motivation for such design is that only in this case the attribute initializers, like
//
//      class {
//          some      : string   = "string"
//      }
// works correctly

export class Base {

    initialize<T extends Base>(props? : Partial<T>) {
        props && Object.assign(this, props)
    }


    static new<T extends typeof Base>(this: T, props? : Partial<InstanceType<T>>) : InstanceType<T> {
        const instance      = new this()

        props && instance.initialize<InstanceType<T>>(props)

        return instance as InstanceType<T>
    }
}


//---------------------------------------------------------------------------------------
export type Constructable<T = Base> = new (...args : any[]) => T

export type Mixin<T extends (...args : any[]) => any> = InstanceType<ReturnType<T>>;


const aa = class Maze extends Base {
    some            : string
}
