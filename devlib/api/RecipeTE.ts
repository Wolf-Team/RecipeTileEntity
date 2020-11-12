/// <reference path="../../../toolchain/declarations/core-engine.d.ts"/>

namespace RecipeTE {
    var AIR_ITEM: ItemInstance = { id: 0, count: 1, data: 0 };

    function defaultCraftFunction(): void { }

    export interface Worckbench {
        sid: string
    }

    export function addWorckbench(sid, Prototype): void { }
    export function registerWorkbench(sid, Prototype): void { }
    export function isRegistered(sid): void { }
    export function addRecipe(sid, result, ingridients, time_multiple, craft): void { }
    export function addShapeRecipe(sid, result, recipe, ingridients, time_multiple, craft): void { }
    export function getRecipes(sid): void { }

    export function getDefaultCraftFunction(): Function {
        return defaultCraftFunction;
    }
}
