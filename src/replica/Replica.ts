import { ChronoGraph, MinimalChronoGraph, PropagationResult} from "../chrono/Graph.js";
import {AnyConstructor, Mixin} from "../class/Mixin.js";
import {Schema} from "../schema/Schema.js";
import {Entity} from "./Entity.js";
import { EffectResolverFunction } from "../chrono/Effect.js";


//---------------------------------------------------------------------------------------------------------------------
export const Replica = <T extends AnyConstructor<ChronoGraph>>(base : T) =>

class Replica extends base {
    schema              : Schema


    addEntity (entity : Entity) {
        entity.enterGraph(this)
    }


    addEntities (entities : Entity[]) {
        entities.forEach(entity => this.addEntity(entity))
    }


    removeEntity (entity : Entity) {
        entity.leaveGraph()
    }


    removeEntities (entities : Entity[]) {
        entities.forEach(entity => this.removeEntity(entity))
    }

    async tryPropagateWithEntites(onEffect? : EffectResolverFunction, entities? : Entity[], hatchFn? : Function) : Promise<PropagationResult> {
        entities && this.addEntities(entities)

        const result = await this.propagate(onEffect, hatchFn || true)

        entities && this.removeEntities(entities)

        return result
    }
}

export type Replica = Mixin<typeof Replica>

export const MinimalReplica = Replica(MinimalChronoGraph)
export type MinimalReplica = InstanceType<typeof MinimalReplica>
