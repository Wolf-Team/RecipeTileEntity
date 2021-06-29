namespace RecipeTE {
    export type RecipeItem = {
        id: number;
        count?: number;
        data?: number;
    }
    export type IngredientsList = { [char_mask: string]: RecipeItem }
    export interface CraftFunction {
        (container: ItemContainer, workbench: Workbench, TE: WorkbenchTileEntity): void;
    }
    export interface Recipe {
        result: RecipeItem;
        mask: string[] | string;
        ingredients: IngredientsList;
        craft: CraftFunction;
    }

    export function defaultCraftFunction(container: ItemContainer, workbench: Workbench, TE: WorkbenchTileEntity): void {
        for (let i = 0; i < workbench.countSlot; i++) {
            let input_slot_name = TE.getInputSlots();
            if (Array.isArray(input_slot_name))
                input_slot_name = input_slot_name[i]
            else
                input_slot_name = input_slot_name + i;

            const slot: ItemInstance = container.getSlot(input_slot_name);
            if (slot.count > 0) {
                slot.count--;

                if (slot.count == 0)
                    slot.data = slot.id = slot.count;
            }
            container.setSlot(input_slot_name, slot.id, slot.count, slot.data, slot.extra);
        }
    };
}