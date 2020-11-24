/// <reference path="Errors.ts" />

namespace RecipeTE {
    export type RecipeItem = { id: number; count?: number; data?: number; }
    export type IngredientsList = { [char_mask: string]: RecipeItem };

    interface CraftFunction {
        (container: ItemContainer, workbench: Workbench, tileEntity: WorkbenchPrototype): void;
    }
    export type Recipe = {
        result: RecipeItem;
        mask: string[] | string;
        ingredients: IngredientsList;
        craft: CraftFunction
    }


    export const AIR_ITEM: RecipeItem = { id: 0, count: 0 };

    type WorkbenchList = { [sID: string]: Workbench };
    export type WorkbenchInfo = {
        window: UI.IWindow;
        columns: number;
        rows?: number;
        input?: string[] | string;
        output?: string;
        scale?: string;
        time?: number;
    }

    export class Workbench implements WorkbenchInfo {
        private sID: string;
        private _window: UI.IWindow;
        private _columns: number;
        private _rows: number = 1;
        private _countSlot: number;
        private _input: string[] | string = "inputSlot";
        private _output: string = "outputSlot";
        private _scale: string = "progressScale";
        private _time: number = 0;
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
        get time(): number {
            return this._time;
        }
        get input(): string[] | string {
            return this._input;
        }
        get output(): string {
            return this._output;
        }
        get scale(): string {
            return this._scale;
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


            if (info.scale != undefined)
                this._scale = info.scale;

            if (info.time != undefined) {
                if (info.time < 0)
                    throw new RangeError(`"info.time" must be >= 0.`);
                this._time = info.time;
            }

        }

        public addRecipe(result: RecipeItem, ingredients: RecipeItem[], craftFunction?: CraftFunction): Workbench {
            if (result.count === undefined) result.count = 1;
            if (result.data === undefined) result.data = 0;

            let count: number = 0;
            let outputIngredients: IngredientsList = {};
            ingredients.forEach((item) => {
                if (item.count === undefined)
                    item.count = 1;
                if (item.data === undefined)
                    item.data = -1;

                count += item.count;
                outputIngredients[`${item.id}:${item.data}`] = item;
            })

            for (let i = ingredients.length - 1; i >= 1; i--) {
                if (ingredients[i].count === undefined)
                    ingredients[i].count = 1;
                if (ingredients[i].data === undefined)
                    ingredients[i].data = -1;

                count += ingredients[i].count;
            }

            if (count > this.countSlot)
                throw new RangeError(`Ingredients must be <= ${this.countSlot}`);

            var recipe: Recipe = {
                result: result,
                mask: null,
                ingredients: outputIngredients,
                craft: craftFunction || defaultCraftFunction
            };

            this.recipes.push(recipe)

            return this;
        }

        public addShapeRecipe(result: RecipeItem, mask: string[] | string, ingredients: IngredientsList, craftFunction?: CraftFunction): Workbench {
            if (result.count === undefined) result.count = 1;
            if (result.data === undefined) result.data = 0;

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


                for (let i = length - 1; i >= 0; i--) {
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
                craft: craftFunction || defaultCraftFunction
            };

            this.recipes.push(recipe)
            return this;
        }

        public getRecipes(): Recipe[] {
            return this.recipes;
        }

        public getRecipe(inputs: ItemInstance[]): Recipe {
            return this.recipes.find((recipe: Recipe) => {
                let select: boolean = false;
                if (Array.isArray(recipe.mask)) {
                    let iLength: number = this.rows - recipe.mask.length,
                        jLength: number = this.cols - recipe.mask[0].length,
                        iOffset: number = 0,
                        jOffset: number = 0;

                    for (let i = 0; i < this.rows; i++) {
                        for (let j = 0; j < this.cols; j++) {
                            if (i > iLength && !select) return false;

                            let input = inputs[i * this.cols + j];
                            if (j > jLength && !select)
                                if (input.id != RecipeTE.AIR_ITEM.id)
                                    return false;

                            if (!select) {
                                let ingredient = recipe.ingredients[recipe.mask[0][0]];
                                if (ingredient.data == undefined)
                                    ingredient.data = -1;

                                if (ingredient.id == input.id && (ingredient.data == -1 || ingredient.data == input.data)) {
                                    iOffset = i;
                                    jOffset = j;
                                    select = true;
                                } else if (input.id != 0) {
                                    return false;
                                }
                            } else {
                                let ingredient = RecipeTE.AIR_ITEM;
                                let row = recipe.mask[i - iOffset];
                                if (row) {
                                    let col = row[j - jOffset];
                                    if (col)
                                        ingredient = recipe.ingredients[col];
                                }
                                if (input.id != ingredient.id) {
                                    if (recipe.ingredients[recipe.mask[0][0]].id == 0) {
                                        select = false;
                                        i = iOffset;
                                        j = jOffset;
                                    } else {
                                        return false;
                                    }
                                }
                            }
                        }
                    }
                } else if (recipe.mask) {
                    let iLength: number = this.countSlot - recipe.mask.length,
                        iOffset: number = 0;
                    for (let i = 0; i < this.countSlot; i++) {
                        if (i > iLength && !select) return false;

                        let input = inputs[i];
                        if (!select) {
                            let ingredient = recipe.ingredients[recipe.mask[0]];
                            if (input.id == ingredient.id) {
                                iOffset = i;
                                select = true;
                            } else if (input.id != 0) {
                                return false;
                            }
                        } else {
                            let ingredient = AIR_ITEM;
                            let col = recipe.mask[i - iOffset];
                            if (col)
                                ingredient = recipe.ingredients[col];

                            if (input.id != ingredient.id)
                                return false;
                        }
                    }
                } else {
                    let currentRecipe = {};

                    for (let i = this.countSlot - 1; i >= 0; i--) {
                        let input = inputs[i];
                        let key = `${input.id}:${input.data}`;
                        if (!recipe.ingredients[`${input.id}:${input.data}`])
                            key = `${input.id}:-1`;

                        if (recipe.ingredients[key]) {
                            if (!currentRecipe[key])
                                currentRecipe[key] = 0;

                            currentRecipe[key]++;
                        } else if (input.id != 0)
                            return false;
                    }

                    for (let i in recipe.ingredients)
                        if (recipe.ingredients[i].count != currentRecipe[i])
                            return false;

                    return true;
                }

                return select;
            }, this)
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

    function defaultCraftFunction(container: ItemContainer, workbench: Workbench): void {
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

    export var isRegister = Workbench.isRegister;
    export function registerWorkbench(sID: string, info: WorkbenchInfo): Workbench {
        let workbench = new Workbench(sID, info);
        Workbench.registerWorkbench(workbench);
        return workbench;
    }

    export function addRecipe(sID: string, result: RecipeItem, ingredients: RecipeItem[], craft?: CraftFunction): void {
        Workbench.getWorkbench(sID).addRecipe(result, ingredients, craft)
    }
    export function addShapeRecipe(sID: string, result: RecipeItem, mask: string[] | string, ingredients: IngredientsList, craft?: CraftFunction): void {
        Workbench.getWorkbench(sID).addShapeRecipe(result, mask, ingredients, craft)
    }
}
//throw new RegisterError(`Workbench with sID "${sID}" yet not been registered.`);