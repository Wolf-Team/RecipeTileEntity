/// <reference path="WorkbenchTileEntity.ts" />

namespace RecipeTE {
    export class TimerWorkbenchTileEntity extends WorkbenchTileEntity {
        private ticks: number = 0;

        public tick() {
            if (!this.currentRecipe || !this.isEnabled)
                return;

            this.ticks++;
            if (this.ticks < this.workbench.time)
                return;

            alert("done!");
            this.ticks = 0;
        }

        public takeResult(amount: number): number {
            return amount;
        }

        public validRecipe(slotName?: string, item?: ItemInstance): void {
            let inputs: ItemInstance[] = this.getInputSlots(slotName, item);
            let recipe: Recipe = this.workbench.getRecipe(inputs);
            this.currentRecipe = recipe;
        }

        public setEnabled(state: boolean): void {
            if (!state)
                this.ticks = 0;

            super.setEnabled(state);
        }
    }
}