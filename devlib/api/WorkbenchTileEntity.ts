namespace RecipeTE {
    export interface WorkbenchPrototype extends TileEntity.TileEntityPrototype {
        workbench: Workbench;
        useNetworkItemContainer: true;
        //TileEntity
        getScreenByName: (name: string) => UI.IWindow;
        getScreenName: (player: number, coords: Vector) => string;
    }

    export class WorkbenchTileEntity implements WorkbenchPrototype {
        public workbench: Workbench;
        public currentRecipe: Recipe;
        public container: ItemContainer;
        public useNetworkItemContainer: true = true;
        private enabled: boolean = true;

        constructor(workbench: Workbench | string, state: boolean = true) {
            this.setWorkbench(workbench);
            this.enabled = state;
        }

        public setWorkbench(workbench: Workbench | string): void {
            if (!Workbench.isRegister(workbench))
                throw new RegisterError(`Workbench with sID "${workbench}" yet not been registered.`);

            if (workbench instanceof Workbench)
                this.workbench = workbench;
            else
                this.workbench = Workbench.getWorkbench(workbench);
        }

        public setTransferPolicy(): void {
            this.container.setGlobalAddTransferPolicy(
                function (container: ItemContainer, name: string, id: number, amount: number, data: number, extra: ItemExtraData, playerUid: number) {
                    let self: WorkbenchTileEntity = container.getParent();
                    if (self.workbench.output == name)
                        return 0;

                    if (self.workbench.hasInputSlot(name)) {
                        self.validRecipe(name, {
                            id: id,
                            data: data,
                            count: container.getSlot(name).count + amount,
                            extra: extra
                        });
                    }
                    return amount;
                });

            this.container.setGlobalGetTransferPolicy(
                function (container: ItemContainer, name: string, id: number, amount: number, data: number, extra: ItemExtraData, playerUid: number) {
                    let self: WorkbenchTileEntity = container.getParent();
                    if (self.workbench.output == name) {
                        for (let i = 0; i < amount; i++)
                            self.currentRecipe.craft(container, self.workbench, self);

                        return amount;
                    }
                    if (self.workbench.hasInputSlot(name)) {
                        let item: ItemInstance = {
                            id: id,
                            data: data,
                            count: container.getSlot(name).count - amount,
                            extra: extra
                        };

                        if (item.count == 0)
                            item = { id: 0, data: 0, count: 0 }

                        self.validRecipe(name, item);
                    }
                    return amount;
                });
        }

        public getInputSlots(): ItemInstance[] {
            let slots: ItemInstance[] = [];

            for (let i = 0, l = this.workbench.countSlot; i < l; i++)
                if (Array.isArray(this.workbench.input))
                    slots.push(this.container.getSlot(this.workbench.input[i]));
                else
                    slots.push(this.container.getSlot(this.workbench.input + i));

            return slots;
        }
        public getOutputSlot(): ItemInstance {
            return this.container.getSlot(this.workbench.output);
        }

        public validRecipe(slotName?: string, item?: ItemInstance): void {
            if (!this.enabled)
                return this.container.clearSlot(this.workbench.output);

            let recipes: Recipe[] = this.workbench.getRecipes();
            let inputs: ItemInstance[] = this.getInputSlots();
            let output: ItemInstance = this.getOutputSlot();

            if (slotName) {
                if (!this.workbench.hasInputSlot(slotName))
                    throw new RangeError(`Not found input slot with name ${slotName} in current workbench(${this.workbench.toString()})`);

                if (item == undefined)
                    throw new TypeError("item was been ItemInstance");

                let i;
                if (Array.isArray(this.workbench.input))
                    i = this.workbench.input.indexOf(slotName);
                else
                    i = parseInt(slotName.replace(this.workbench.input, ""));

                inputs[i] = item;
            }

            let recipe: Recipe = recipes.find((recipe: Recipe) => {
                let select: boolean = false;
                if (Array.isArray(recipe.mask)) {
                    let iLength: number = this.workbench.rows - recipe.mask.length,
                        jLength: number = this.workbench.cols - recipe.mask[0].length,
                        iOffset: number = 0,
                        jOffset: number = 0;

                    for (let i = 0; i < this.workbench.rows; i++) {
                        for (let j = 0; j < this.workbench.cols; j++) {
                            if (i > iLength && !select) return false;

                            let input = inputs[i * this.workbench.cols + j];
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
                    let iLength: number = this.workbench.countSlot - recipe.mask.length,
                        iOffset: number = 0;
                    for (let i = 0; i < this.workbench.countSlot; i++) {
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

                    for (let i = this.workbench.countSlot - 1; i >= 0; i--) {
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

            let result: RecipeItem = RecipeTE.AIR_ITEM;
            if (recipe)
                result = recipe.result;

            if (result.count === undefined)
                result.count = 1;

            if (result.data === undefined)
                result.data = 0;

            let count = 1;

            if (result.id != 0) {
                count = 0;
                for (let i = inputs.length - 1; i >= 1 && count != 1; i--)
                    if ((count == 0 && inputs[i].count != 0) || (count > inputs[i].count))
                        count = inputs[i].count;
            }
            this.currentRecipe = recipe;
            this.container.setSlot(this.workbench.output, result.id, result.count * count, result.data);
        }

        //TileEntity
        public init(): void {
            this.container.setParent(this);

            this.setTransferPolicy();
        }
        public getScreenName(): string {
            return "main";
        }
        public getScreenByName(): UI.IWindow {
            return this.workbench.window;
        }

        public registerTileEntity(BlockID: number): void {
            TileEntity.registerPrototype(BlockID, this);
        }


        public setEnabled(state: boolean): void {
            this.enabled = state;
            this.validRecipe();
        }

        public enable(): void {
            this.setEnabled(true);
        }
        public disable(): void {
            this.setEnabled(false);
        }

        public isEnabled():boolean{
            return this.enabled;
        }
    }

    export function registerTileEntity(BlockID: number, prototype: WorkbenchPrototype): void {
        if (prototype instanceof WorkbenchTileEntity)
            prototype.registerTileEntity(BlockID);

    }
}