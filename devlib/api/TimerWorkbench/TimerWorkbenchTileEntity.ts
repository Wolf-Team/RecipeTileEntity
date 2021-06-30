/// <reference path="../Workbench/WorkbenchTileEntity.ts" />
/// <reference path="TimerWorkbench.ts" />


namespace RecipeTE {
    export abstract class TimerWorkbenchTileEntity<T extends RecipeDataTimer = RecipeDataTimer> extends WorkbenchTileEntity<T> {
        protected workbench: TimerWorkbench<T>;
        protected ticks: number = 0;
        public abstract getScale(): string;

        public setEnabled(state: boolean): void {
            if (!state)
                this.container.setScale(this.getScale(), this.ticks = 0);

            super.setEnabled(state);
        }


        protected takeResult(container: ItemContainer, name: string, id: number, amount: number, data: number, extra: ItemExtraData, playerUid: number): number {
            let item: ItemInstance = {
                id: id,
                data: data,
                count: container.getSlot(name).count - amount,
                extra: extra
            };

            if (item.count == 0)
                item = { id: 0, data: 0, count: 0 };

            this.validRecipe(name, item);
            return amount;
        }

        protected validRecipe(slotName: string, item: ItemInstance): void;
        protected validRecipe(): void;
        protected validRecipe(slotName?: string, item?: ItemInstance): void {
            let inputs: ItemInstance[] = this.getItems(slotName, item);
            let recipe: Recipe = this.workbench.getRecipe(inputs);
            if (!recipe) {
                this.container.setScale(this.getScale(), this.ticks = 0);
                return this.currentRecipe = null;
            }

            let output = (slotName && slotName == this.getOutputSlot()) ? item : this.container.getSlot(slotName);

            if (output.id == 0 || output.id == recipe.result.id)
                this.currentRecipe = recipe;
            else
                this.currentRecipe = null;
        }

        //TileEntity
        public tick() {
            if (this.currentRecipe && this.isEnabled()) {
                this.ticks += 1 * this.currentRecipe.data.multiply;

                this.container.setScale(this.getScale(), this.ticks / this.workbench.timer);

                const outputSlotName = this.getOutputSlot();

                if (this.ticks >= this.workbench.timer) {
                    let output = this.container.getSlot(outputSlotName);
                    this.currentRecipe.craft(this.container, this.workbench, this)
                    this.container.setSlot(outputSlotName,
                        this.currentRecipe.result.id,
                        output.count + this.currentRecipe.result.count,
                        this.currentRecipe.result.data);

                    this.validRecipe();
                    this.ticks = 0;
                }
            }
            this.container.sendChanges();
        }
    }
}