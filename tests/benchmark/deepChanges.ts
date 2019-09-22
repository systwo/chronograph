import { Benchmark } from "../../src/benchmark/Benchmark.js"
import { deepGraphGen, deepGraphSync, GraphGenerationResult, mobxGraph, MobxGraphGenerationResult } from "./data.js"

type PostBenchInfo = {
    totalCount      : number
    result          : number
}

class DeepChangesChronoGraph extends Benchmark<GraphGenerationResult, PostBenchInfo> {

    gatherInfo (state : GraphGenerationResult) : PostBenchInfo {
        const { graph, boxes } = state

        return {
            totalCount      : state.counter,
            result          : graph.read(boxes[ boxes.length - 1 ])
        }
    }


    stringifyInfo (info : PostBenchInfo) : string {
        return `Total calculation: ${info.totalCount}\nResult in last box: ${info.result}`
    }


    cycle (iteration : number, cycle : number, setup : GraphGenerationResult) {
        const { graph, boxes } = setup

        graph.write(boxes[ 0 ], iteration + cycle)

        graph.propagateSync()
    }
}


class DeepChangesMobx extends Benchmark<MobxGraphGenerationResult, PostBenchInfo> {

    gatherInfo (state : MobxGraphGenerationResult) : PostBenchInfo {
        const { boxes } = state

        return {
            totalCount      : state.counter,
            result          : boxes[ boxes.length - 1 ].get()
        }
    }


    stringifyInfo (info : PostBenchInfo) : string {
        return `Total calculation: ${info.totalCount}\nResult in last box: ${info.result}`
    }


    cycle (iteration : number, cycle : number, setup : MobxGraphGenerationResult) {
        const { boxes } = setup

        boxes[ 0 ].set(iteration + cycle)

        // seems mobx does not have concept of eager computation, need to manually read all atoms
        for (let k = 0; k < boxes.length; k++) boxes[ k ].get()
    }
}


export const deepChangesGen = DeepChangesChronoGraph.new({
    name        : 'Deep graph changes - generators',

    setup       : () => {
        return deepGraphGen(1300)
    }
})


export const deepChangesSync = DeepChangesChronoGraph.new({
    name        : 'Deep graph changes - synchronous',

    setup       : () => {
        return deepGraphSync(1300)
    }
})

export const deepChangesMobx = DeepChangesMobx.new({
    name        : 'Deep graph changes - Mobx',

    setup       : () => {
        return mobxGraph(1300)
    }
})


export const runAll = async () => {
    const runInfo   = await deepChangesGen.measureTillMaxTime()

    console.log(runInfo)

    await deepChangesSync.measureFixed(runInfo.cyclesCount, runInfo.samples.length)
    await deepChangesMobx.measureFixed(runInfo.cyclesCount, runInfo.samples.length)
}
