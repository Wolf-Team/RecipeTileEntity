/// <reference path="RecipeTEDev.ts" />

namespace RecipeTE {
    var AIR_ITEM: ItemInstance = { id: 0, count: 1, data: 0 };

    export interface WorckbenchInfo {
        sid: string
        columns: number
        rows?: number
        window?: UI.Window | UI.WindowGroup
        rv_window?: UI.Window | UI.WindowGroup
        input?: string[] | string
        output?: string
        scale?: string
        time?: number
    }

    export interface Worckbench extends TileEntity.TileEntityPrototype {
        _workbench_info?: WorckbenchInfo
        condition?: () => boolean
    }

    export function addWorckbench(worckbench: WorckbenchInfo) {
        RecipeTEDev.mechanisms[worckbench.sid] = worckbench;
        worckbench.window.getContent().
                elements[worckbench.output].isValid = RecipeTEDev.outputSlotValid;
    }

    export function registerWorkbench(worckbench: WorckbenchInfo, Prototype: Worckbench) {
        if(!(worckbench.window instanceof UI.Window || worckbench.window instanceof UI.WindowGroup))
            throw new Error("worckbench.window was been UI.IWindow");

        addWorckbench(worckbench);
        
        Prototype._workbench_info = worckbench;

        Prototype.getScreenName = function(){ return "main"; }
        Prototype.getScreenByName = function(){
            return worckbench.window;
        }
        Prototype.setWorkbench = function (sid) {
            // if (!RecipeTE.isRegistered(sid))
            //     throw "Верстак \"" + sid + "\" не зарегистрирован.";

            this._workbench_info = RecipeTEDev.mechanisms[sid];
        }

        TileEntity.registerPrototype(BlockID[worckbench.scale], Prototype)
    }

    // export function addWorckbench(sid, Prototype): void { }
    // export function registerWorkbench(sid, Prototype): void { }
    // export function isRegistered(sid): void { }
    // export function addRecipe(sid, result, ingridients, time_multiple, craft): void { }
    // export function addShapeRecipe(sid, result, recipe, ingridients, time_multiple, craft): void { }
    // export function getRecipes(sid): void { }

    // function defaultCraftFunction(): void { }
    // export function getDefaultCraftFunction(): Function {
    //     return defaultCraftFunction;
    // }
}
