/// <reference path="WorkbenchTileEntity.ts" />

namespace RecipeTE {
    export class TimerWorkbenchTileEntity extends WorkbenchTileEntity {
        private ticks: number = 0;

        public tick() {
            if (this.currentRecipe && this.isEnabled()) {
                this.ticks++;

                this.container.setScale(this.workbench.scale, this.ticks / this.workbench.time);

                if (this.ticks >= this.workbench.time) {
                    let output = this.getOutputSlot();
                    this.currentRecipe.craft(this.container, this.workbench, this)
                    this.container.setSlot(this.workbench.output,
                        this.currentRecipe.result.id,
                        output.count + this.currentRecipe.result.count,
                        this.currentRecipe.result.data);

                    this.validRecipe();
                    this.ticks = 0;
                }
            }
            this.container.sendChanges();
        }

        public takeResult(container: ItemContainer, name: string, id: number, amount: number, data: number, extra: ItemExtraData, playerUid: number): number {
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

        public validRecipe(slotName?: string, item?: ItemInstance): void {
            let inputs: ItemInstance[] = this.getInputSlots(slotName, item);
            let recipe: Recipe = this.workbench.getRecipe(inputs);
            if (!recipe) {
                this.container.setScale(this.workbench.scale, this.ticks = 0);
                return this.currentRecipe = null;
            }

            let output = (slotName && slotName == this.workbench.output) ? item : this.getOutputSlot();

            if (output.id == 0 || output.id == recipe.result.id)
                this.currentRecipe = recipe;
            else
                this.currentRecipe = null;
        }

        public setEnabled(state: boolean): void {
            if (!state)
                this.container.setScale(this.workbench.scale, this.ticks = 0);

            super.setEnabled(state);
        }
    }
}