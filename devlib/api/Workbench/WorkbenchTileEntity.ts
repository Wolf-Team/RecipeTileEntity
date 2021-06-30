namespace RecipeTE {

    class TransferPolicyList {
        private list: TransferPolicy[] = [];
        private count = 0;
        public add(policy: TransferPolicy) {
            this.count++;
            return this.list.push(policy);
        }
        public remove(policy: TransferPolicy | number) {
            if (typeof policy != "number")
                policy = this.list.findIndex(e => e == policy);

            delete this.list[policy];
        }
        public invoke(container: ItemContainer, name: string, id: number, amount: number, data: number, extra: ItemExtraData, playerUid: number): number {
            let returnAmount = Number.MAX_SAFE_INTEGER;

            for (let i = 0; i < this.count; i++) {
                const policy = this.list[i];
                if (policy == null) continue;

                const _amount = policy(container, name, id, amount, data, extra, playerUid);
                if (_amount == 0) return 0;

                if (_amount < returnAmount)
                    returnAmount = _amount;
            }
            return returnAmount;
        }
    }

    type WorkbenchTileEntityData = { enabled?: boolean, [key: string]: any };

    export abstract class WorkbenchTileEntity<Data = any> implements TileEntity.TileEntityPrototype {
        protected workbench: Workbench<Data>;
        protected currentRecipe: Recipe<Data>;
        protected container: ItemContainer;
        public readonly useNetworkItemContainer: true = true;

        public defaultValues: WorkbenchTileEntityData;
        protected data: WorkbenchTileEntityData;

        constructor(workbench: Workbench, state: boolean = true) {
            this.setWorkbench(workbench);
            this.defaultValues = {
                enabled: state
            };
        }

        public setWorkbench(workbench: Workbench): void {
            this.workbench = workbench;
        }

        protected takeResult(container: ItemContainer, name: string, id: number, amount: number, data: number, extra: ItemExtraData, playerUid: number): number {
            for (let i = 0; i < amount; i++)
                this.currentRecipe.craft(container, this.workbench, this);

            return amount;
        }

        private GlobalAddPolicy = new TransferPolicyList();
        private GlobalGetPolicy = new TransferPolicyList();

        private setTransferPolicy(): void {
            this.container.setGlobalAddTransferPolicy(
                function (container: ItemContainer, name: string, id: number, amount: number, data: number, extra: ItemExtraData, playerUid: number) {
                    let self: WorkbenchTileEntity = container.getParent();
                    if (self.getOutputSlot() == name)
                        return 0;

                    if (self.hasInputSlot(name)) {
                        self.validRecipe(name, {
                            id: id,
                            data: data,
                            count: container.getSlot(name).count + amount,
                            extra: extra
                        });
                    }

                    const _a = self.GlobalAddPolicy.invoke(container, name, id, amount, data, extra, playerUid);
                    return _a < amount ? _a : amount;
                });

            this.container.setGlobalGetTransferPolicy(
                function (container: ItemContainer, name: string, id: number, amount: number, data: number, extra: ItemExtraData, playerUid: number) {
                    let self: WorkbenchTileEntity = container.getParent();
                    if (self.getOutputSlot() == name) {
                        return self.takeResult(container, name, id, amount, data, extra, playerUid);
                    }
                    if (self.hasInputSlot(name)) {
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

                    const _a = self.GlobalGetPolicy.invoke(container, name, id, amount, data, extra, playerUid);
                    return _a < amount ? _a : amount;
                });
        }

        public readonly addGlobalAddTransferPolicy = this.GlobalAddPolicy.add.bind(this.GlobalAddPolicy);
        public readonly addGlobalGetTransferPolicy = this.GlobalGetPolicy.add.bind(this.GlobalGetPolicy);

        protected getItems(slotName: string, item: ItemInstance): ItemInstance[];
        protected getItems(): ItemInstance[]
        protected getItems(slotName?: string, item?: ItemInstance): ItemInstance[] {
            let slots: ItemInstance[] = [];
            const slotsName = this.getInputSlots();

            for (let i = 0, l = this.workbench.countSlot; i < l; i++) {
                let key: string;
                if (Array.isArray(slotsName))
                    key = slotsName[i];
                else
                    key = slotsName + i;

                slots.push(slotName == key ? item : this.container.getSlot(key));
            }

            return slots;
        }

        protected validRecipe(slotName: string, item: ItemInstance): void;
        protected validRecipe(): void;
        protected validRecipe(slotName?: string, item?: ItemInstance): void {
            const outputSlotName = this.getOutputSlot();
            if (!this.isEnabled()) {
                this.currentRecipe = null;
                return this.container.clearSlot(outputSlotName);
            }

            let inputs: ItemInstance[] = this.getItems(slotName, item);

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
            this.container.setSlot(outputSlotName, result.id, result.count * count, result.data);
        }


        //TileEntity
        public init(): void {
            this.container.setParent(this);

            this.setTransferPolicy();
        }
        public abstract getScreenName(): string;
        public abstract getScreenByName(): Windows;
        public abstract getInputSlots(): string | string[];
        public abstract getOutputSlot(): string;

        public hasInputSlot(name: string) {
            const slots = this.getInputSlots();
            if (Array.isArray(slots))
                return slots.indexOf(name) != -1;

            const i = parseInt(name.match(new RegExp(slots + "([0-9]+)"))[1]);
            return i >= 0 && i < this.workbench.countSlot;
        }

        public setEnabled(state: boolean): void {
            this.data.enabled = state;
            this.validRecipe();
        }

        public enable(): void {
            this.setEnabled(true);
        }
        public disable(): void {
            this.setEnabled(false);
        }

        public isEnabled(): boolean {
            return this.data.enabled;
        }
    }
}