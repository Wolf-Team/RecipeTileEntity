/// <reference path="Errors.ts" />

namespace RecipeTE {
    type WorkbenchList = { [sID: string]: Workbench };
    export type RecipeItem = { id: number; count?: number; data?: number; }
    type IngredientsList = { [char_mask: string]: RecipeItem };

    type WorkbenchInfo = {
        window: UI.IWindow;
        columns: number;
        rows?: number;
        input?: string[] | string;
        output?: string;
    }

    interface CraftFunction {
        (container: ItemContainer, workbench: Workbench, tileEntity: WorkbenchPrototype): void;
    }

    function defaultCraftFunction(container: ItemContainer, workbench: Workbench) {
        for (var i = 0; i < workbench.countSlot; i++) {
            var input_slot_name: string;
            if (Array.isArray(workbench.input))
                input_slot_name = workbench.input[i]
            else
                input_slot_name = workbench.input + i;

            var slot: ItemInstance = container.getSlot(input_slot_name);
            if (slot.count > 0) {
                slot.count--;

                if (slot.count == 0)
                    slot.data = slot.id = slot.count;
            }
            container.setSlot(input_slot_name, slot.id, slot.count, slot.data, slot.extra);
        }
    }

    export type Recipe = {
        result: RecipeItem;
        mask: string[] | string;
        ingredients: IngredientsList;
        craft: CraftFunction
    }

    export const AIR_ITEM: RecipeItem = { id: 0, count: 0 };

    export class Workbench implements WorkbenchInfo {
        private sID: string;
        private _window: UI.IWindow;
        private _columns: number;
        private _rows: number = 1;
        private _countSlot: number;
        private _input: string[] | string = "inputSlot";
        private _output: string = "outputSlot";
        private recipes: Recipe[] = [];

        get countSlot(): number {
            return this._countSlot;
        }
        get window(): UI.IWindow {
            return this._window;
        }
        get columns(): number {
            return this._columns;
        }
        get cols(): number {
            return this._columns;
        }
        get rows(): number {
            return this._rows;
        }
        get input(): string[] | string {
            return this._input;
        }
        get output(): string {
            return this._output;
        }

        constructor(sID: string, info: WorkbenchInfo) {
            this.sID = sID;
            this._window = info.window;

            if (info.columns < 1)
                throw new RangeError(`"info.columns" must be > 0.`);
            this._columns = info.columns;

            if (info.rows != undefined) {
                if (info.rows < 1)
                    throw new RangeError(`"info.rows" must be > 0.`);

                this._rows = info.rows || 1;
            }

            this._countSlot = this._columns * this._rows;

            if (info.input) {
                if (Array.isArray(info.input) && info.input.length != this.countSlot)
                    throw new RangeError(`Length "info.input" mast be = ${this.countSlot}(columns * rows).`);

                this._input = info.input;
            }

            if (info.output != undefined)
                this._output = info.output;

            //window.getContent().elements
        }

        public addRecipe(result: RecipeItem, mask: string[] | string, ingredients: IngredientsList, craftFunction?: CraftFunction): Workbench {
            let length = mask.length;
            if (ingredients["#"])
                throw new SyntaxError("Ingredient cannot be registered to char #");

            if (ingredients[" "])
                throw new SyntaxError("Ingredient cannot be registered to chas \"space\"");

            ingredients["#"] = AIR_ITEM;

            if (Array.isArray(mask)) {
                if (length > this.rows)
                    throw new RangeError(`Length of the mask must be <= ${this.rows}`);
                else if (length < 1)
                    throw new RangeError(`Length of the mask must be >= 1`);

                let l = mask[0].length;

                if (l > this.columns)
                    throw new RangeError(`Length of the mask line must be <= ${this.columns}`);
                else if (l < 1)
                    throw new RangeError(`Length of the mask line must be >= 1`);


                for (let i = length - 1; i >= 1; i--) {
                    let ll = mask[i].length;
                    if (ll == 0)
                        mask[i] = "".padStart(l, "#");
                    else if (ll != l)
                        throw new RangeError(`Mask lines must be the same size.`);
                    else
                        mask[i] = mask[i].replace(/\s/g, "#");

                    for (let ii = l - 1; ii >= 0; ii--)
                        if (ingredients[mask[i][ii]] == undefined)
                            throw new SyntaxError("Unknown ingredient " + mask[i][ii]);
                }

            } else if (length > this.countSlot)
                throw new RangeError(`Length of the mask must be <= ${this.countSlot}`);
            else if (length < 1)
                throw new RangeError(`Length of the mask must be >= 1`);
            else {
                mask = mask.replace(/\s/g, "#");

                for (let i = length - 1; i >= 0; i--)
                    if (ingredients[mask[i]] == undefined)
                        throw new SyntaxError("Unknown ingredient " + mask[i]);
            }

            var recipe: Recipe = {
                result: result,
                mask: mask,
                ingredients: ingredients,
                craft: defaultCraftFunction
            };

            if (craftFunction)
                recipe.craft = craftFunction;

            this.recipes.push(recipe)
            return this;
        }
        public getRecipes(): Recipe[] {
            return this.recipes;
        }

        public hasInputSlot(nameSlot: string): boolean {
            if (Array.isArray(this._input))
                return this._input.indexOf(nameSlot) != -1

            if (!nameSlot.startsWith(this._input))
                return false;

            let i = parseInt(nameSlot.replace(this._input, ""));
            if (isNaN(i))
                return false;

            return i >= 0 && i < this.countSlot;
        }

        public toString(): string {
            return this.sID;
        }

        private static workbenches: WorkbenchList = {};
        public static isRegister(workbench: Workbench | string): boolean {
            if (workbench instanceof Workbench)
                workbench = workbench.sID;

            return this.workbenches[workbench] != undefined;
        }
        public static registerWorkbench(workbench: Workbench): void {
            if (this.isRegister(workbench))
                throw new RegisterError(`Workbench with sID "${workbench.sID}" already has been registered.`);

            this.workbenches[workbench.sID] = workbench;
        }
        public static getWorkbench(sID: string): Workbench {
            if (!this.isRegister(sID))
                throw new RegisterError(`Workbench with sID "${sID}" yet not been registered.`);

            return this.workbenches[sID];
        }
    }

    export var isRegister = Workbench.isRegister;
    export function registerWorkbench(sID: string, info: WorkbenchInfo): Workbench {
        let workbench = new Workbench(sID, info);
        Workbench.registerWorkbench(workbench);
        return workbench;
    }
    export function addRecipe(sID:string, result:RecipeItem, mask:string[]|string, ingredients:IngredientsList, craft?:CraftFunction){
        Workbench.getWorkbench(sID).addRecipe(result, mask, ingredients, craft)
    }
}
//throw new RegisterError(`Workbench with sID "${sID}" yet not been registered.`);