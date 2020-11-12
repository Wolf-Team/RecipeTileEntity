namespace RecipeTEDev {
    export var mechanisms: { [id: string]: RecipeTE.Worckbench; } = {};
    export var recipes = {};

    export function isOpen(TE): boolean {
        return false;
    }
    export function checkChangeWorkbenchInputs(TE): boolean {
        return false;
    }
    export function WorkbenchTick(): void {

    }
    export function FurnaceTick(): void {

    }
    export function getOffsetWindow(mech): number {
        return 0
    }
    export function checkRecipe(recipe, item, used): boolean {
        return false;
    }

    export function outputSlotValid(): boolean {
        return false;
    }
}