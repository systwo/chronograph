import { Benchmark } from "../../src/benchmark/Benchmark.js"
import { deepGraphGen, deepGraphSync, mobxGraph } from "./data.js"


export const graphPopulationGen = Benchmark.new({
    name        : 'Graph population - generators',

    cycle       : async (iteration : number, cycle : number, setup : any) => {
        deepGraphGen(100000)
    }
})


export const graphPopulationSync = Benchmark.new({
    name        : 'Graph population - synchronous',

    cycle       : async (iteration : number, cycle : number, setup : any) => {
        deepGraphSync(100000)
    }
})


export const graphPopulationMobx = Benchmark.new({
    name        : 'Graph population - Mobx',

    cycle       : async (iteration : number, cycle : number, setup : any) => {
        mobxGraph(100000)
    }
})


//---------------------------------------------------------------------------------------------------------------------
export const runAllGraphPopulation = async () => {
    await graphPopulationGen.measureTillRelativeMoe()
    await graphPopulationSync.measureTillRelativeMoe()
    await graphPopulationMobx.measureTillRelativeMoe()
}
