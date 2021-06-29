namespace RecipeTE {
    export class Workbench {
        public readonly cols: number;
        public readonly rows: number = 1;
        public readonly countSlot: number = 1;
        private _recipes: Recipe[] = [];

        constructor(info: WorkbenchInfo);
        constructor(cols: number);
        constructor(info: WorkbenchInfo | number) {
            if (typeof info == "number") {
                this.countSlot = this.cols = info;
            } else {
                this.cols = info.columns;
                if (info.rows) this.rows = info.rows;
                this.countSlot = this.cols * this.rows;
            }
        }

        public addRecipe(result: RecipeItem, ingredients: RecipeItem[], craftFunction: CraftFunction = defaultCraftFunction): this {
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
            });

            if (count > this.countSlot)
                throw new RangeError(`Ingredients must be <= ${this.countSlot}(columns * rows)`);

            this._recipes.push({
                result: result,
                ingredients: null,
                craft: craftFunction,
                mask: null
            });
            return this;
        }
        public addShapeRecipe(result: RecipeItem, mask: string[] | string, ingredients: IngredientsList, craftFunction: CraftFunction = defaultCraftFunction): this {
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

                if (l > this.cols)
                    throw new RangeError(`Length of the mask line must be <= ${this.cols}`);
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

            this._recipes.push({
                result: result,
                mask: mask,
                ingredients: ingredients,
                craft: craftFunction
            })
            return this;
        }

        public getRecipe(inputs: ItemInstance[]): Recipe {
            if (inputs.length != this.countSlot)
                throw new RangeError("Length 'inputs' != " + this.countSlot);

            return this._recipes.find((recipe: Recipe) => {
                let select: boolean = false;
                if (Array.isArray(recipe.mask)) {
                    let rowLength: number = this.rows - recipe.mask.length,
                        colLength: number = this.cols - recipe.mask[0].length,
                        rowOffset: number = 0,
                        colOffset: number = 0;

                    for (let row = 0; row < this.rows; row++) {
                        if (row > rowLength && !select) return false;
                        for (let col = 0; col < this.cols; col++) {

                            if (row > rowLength && !select) return false;
                            let input = inputs[row * this.cols + col];

                            if (col > colLength && !select)
                                if (input.id != RecipeTE.AIR_ITEM.id)
                                    return false;

                            if (!select) {
                                let ingredient = recipe.ingredients[recipe.mask[0][0]];
                                if (ingredient.data == undefined)
                                    ingredient.data = -1;

                                if (ingredient.id == input.id && (ingredient.data == -1 || ingredient.data == input.data)) {
                                    rowOffset = row;
                                    colOffset = col;
                                    select = true;
                                } else if (input.id != 0) {
                                    return false;
                                }
                            } else {
                                let ingredient = RecipeTE.AIR_ITEM;
                                let _row = recipe.mask[row - rowOffset];
                                if (_row) {
                                    let _col = _row[col - colOffset];
                                    if (_col)
                                        ingredient = recipe.ingredients[_col];
                                }
                                if (input.id != ingredient.id) {
                                    if (recipe.ingredients[recipe.mask[0][0]].id == 0) {
                                        select = false;
                                        row = rowOffset;
                                        col = colOffset;
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
            }, this);
        }

    }
}