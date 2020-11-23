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

        public takeResult(amount: number): number {
            for (let i = 0; i < amount; i++)
                this.currentRecipe.craft(this.container, this.workbench, this);

            return amount;
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
                        return self.takeResult(amount);
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

        public getInputSlots(slotName?: string, item?: ItemInstance): ItemInstance[] {
            let slots: ItemInstance[] = [];

            for (let i = 0, l = this.workbench.countSlot; i < l; i++) {
                let key: string;
                if (Array.isArray(this.workbench.input))
                    key = this.workbench.input[i];
                else
                    key = this.workbench.input + i;

                slots.push(slotName == key ? item : this.container.getSlot(key));
            }

            return slots;
        }
        public getOutputSlot(): ItemInstance {
            return this.container.getSlot(this.workbench.output);
        }

        public validRecipe(slotName?: string, item?: ItemInstance): void {
            if (!this.enabled) {
                this.currentRecipe = null;
                return this.container.clearSlot(this.workbench.output);
            }

            let inputs: ItemInstance[] = this.getInputSlots(slotName, item);

            let recipe: Recipe = this.workbench.getRecipe(inputs);

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

        public isEnabled(): boolean {
            return this.enabled;
        }
    }

    export function registerTileEntity(BlockID: number, prototype: WorkbenchPrototype): void {
        if (prototype instanceof WorkbenchTileEntity)
            prototype.registerTileEntity(BlockID);

    }
}