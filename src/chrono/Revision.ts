import { AnyConstructor, Base, Mixin } from "../class/Mixin.js"
import { VisitInfo } from "../graph/WalkDepth.js"
import { Identifier } from "./Identifier.js"
import { Quark } from "./Quark.js"
import { QuarkTransition } from "./QuarkTransition.js"
import { MinimalTransaction } from "./Transaction.js"


//---------------------------------------------------------------------------------------------------------------------
export class QuarkEntry extends Set<QuarkEntry> implements VisitInfo {

    static new<T extends typeof QuarkEntry> (this : T, props? : Partial<InstanceType<T>>) : InstanceType<T> {
        const instance      = new this()

        Object.assign(instance, props)

        return instance as InstanceType<T>
    }


    identifier          : Identifier

    quark               : InstanceType<this[ 'identifier' ][ 'quarkClass']>
    transition          : QuarkTransition

    previous            : QuarkEntry

    sameAsPrevious          : boolean = false

    // placing these initial values to the prototype makes the `benchmark_sync` slower - from ~630ms to ~830
    edgesFlow               : number = 0
    visitedAt               : number = -1
    visitedTopologically    : boolean = false


    get level () : number {
        return this.identifier.level
    }


    forceCalculation () {
        this.edgesFlow  = 1e9
    }


    cleanup (includingQuark : boolean) {
        this.previous       = undefined
        this.transition     = undefined

        if (includingQuark) this.quark = undefined
    }


    getTransition () : QuarkTransition {
        if (this.transition) return this.transition

        return this.transition = this.identifier.transitionClass.new({
            identifier      : this.identifier
            // current         : this,
            // previous        : null,
            //
            // edgesFlow       : 0,
            //
            // visitedAt       : -1,
            // visitedTopologically : false
        })
    }


    getQuark () : Quark {
        if (this.quark) return this.quark

        return this.quark = this.identifier.quarkClass.new({ identifier : this.identifier }) as InstanceType<this[ 'identifier' ][ 'quarkClass']>
    }


    get outgoing () : Set<QuarkEntry> {
        return this
    }


    getOutgoing () : Set<QuarkEntry> {
        return this
    }


    get value () : any {
        return this.quark ? this.quark.value : undefined
    }


    hasValue () : boolean {
        return Boolean(this.quark && this.quark.hasValue())
    }
}

export type Scope = Map<Identifier, QuarkEntry>


//---------------------------------------------------------------------------------------------------------------------
let COUNTER : number = 0

export const Revision = <T extends AnyConstructor<Base>>(base : T) =>

class Revision extends base {
    name                    : string    = 'revision-' + (COUNTER++)

    previous                : Revision

    scope                   : Scope     = new Map()

    reachableCount          : number    = 0
    referenceCount          : number    = 0

    selfDependentQuarks     : Set<Quark>    = new Set()


    getLatestEntryFor (identifier : Identifier) : QuarkEntry {
        let revision : Revision = this

        while (revision) {
            const entry = revision.scope.get(identifier)

            if (entry) return entry

            revision    = revision.previous
        }

        return null
    }


    * previousAxis () : Generator<Revision> {
        let revision : Revision = this

        while (revision) {
            yield revision

            revision    = revision.previous
        }
    }


    read (identifier : Identifier) : any {
        const latestEntry   = this.getLatestEntryFor(identifier)

        if (!latestEntry) throw new Error("Unknown identifier")

        if (latestEntry.hasValue()) {
            return latestEntry.value
        } else {
            return this.calculateLazyEntry(latestEntry)
        }
    }


    calculateLazyEntry (entry : QuarkEntry) : any {
        const transaction   = MinimalTransaction.new({ baseRevision : this, candidate : this })

        transaction.entries.set(entry.identifier, entry)
        transaction.stackGen.push(entry)

        entry.forceCalculation()

        transaction.propagate()

        return entry.quark.value
    }

}

export type Revision = Mixin<typeof Revision>

export interface RevisionI extends Revision {}


export class MinimalRevision extends Revision(Base) {}
