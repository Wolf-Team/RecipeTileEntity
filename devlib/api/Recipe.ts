namespace RecipeTE {
    export type RecipeItem = {
        id: number;
        count?: number;
        data?: number;
    }
    export type IngredientsList = { [char_mask: string]: RecipeItem }
    export interface CraftFunction {
        (container: ItemContainer, workbench: Workbench): void;
    }
    export interface Recipe {
        result: RecipeItem;
        mask: string[] | string;
        ingredients: IngredientsList;
        craft: CraftFunction;
    }

    export function defaultCraftFunction(container: ItemContainer, workbench: Workbench): void {
    //     for (var i = 0; i < workbench.countSlot; i++) {
    //         var input_slot_name: string;
    //         if (Array.isArray(workbench.input))
    //             input_slot_name = workbench.input[i]
    //         else
    //             input_slot_name = workbench.input + i;

    //         var slot: ItemInstance = container.getSlot(input_slot_name);
    //         if (slot.count > 0) {
    //             slot.count--;

    //             if (slot.count == 0)
    //                 slot.data = slot.id = slot.count;
    //         }
    //         container.setSlot(input_slot_name, slot.id, slot.count, slot.data, slot.extra);
    //     }
    };
}