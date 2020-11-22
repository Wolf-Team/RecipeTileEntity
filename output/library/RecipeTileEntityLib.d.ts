declare namespace RecipeTE {
    class RegisterError extends Error {
    }
}
declare namespace RecipeTE {
    export type RecipeItem = {
        id: number;
        count?: number;
        data?: number;
    };
    type IngredientsList = {
        [char_mask: string]: RecipeItem;
    };
    type WorkbenchInfo = {
        window: UI.IWindow;
        columns: number;
        rows?: number;
        input?: string[] | string;
        output?: string;
    };
    interface CraftFunction {
        (container: ItemContainer, workbench: Workbench, tileEntity: WorkbenchPrototype): void;
    }
    export type Recipe = {
        result: RecipeItem;
        mask: string[] | string;
        ingredients: IngredientsList;
        craft: CraftFunction;
    };
    export const AIR_ITEM: RecipeItem;
    export class Workbench implements WorkbenchInfo {
        private sID;
        private _window;
        private _columns;
        private _rows;
        private _countSlot;
        private _input;
        private _output;
        private recipes;
        get countSlot(): number;
        get window(): UI.IWindow;
        get columns(): number;
        get cols(): number;
        get rows(): number;
        get input(): string[] | string;
        get output(): string;
        constructor(sID: string, info: WorkbenchInfo);
        addRecipe(result: RecipeItem, mask: string[] | string, ingredients: IngredientsList, craftFunction?: CraftFunction): Workbench;
        getRecipes(): Recipe[];
        hasInputSlot(nameSlot: string): boolean;
        toString(): string;
        private static workbenches;
        static isRegister(workbench: Workbench | string): boolean;
        static registerWorkbench(workbench: Workbench): void;
        static getWorkbench(sID: string): Workbench;
    }
    export var isRegister: typeof Workbench.isRegister;
    export function registerWorkbench(sID: string, info: WorkbenchInfo): Workbench;
    export function addRecipe(sID: string, result: RecipeItem, mask: string[] | string, ingredients: IngredientsList, craft?: CraftFunction): void;
}
declare namespace RecipeTE {
    interface WorkbenchPrototype extends TileEntity.TileEntityPrototype {
        workbench: Workbench;
        useNetworkItemContainer: true;
        getScreenByName: (name: string) => UI.IWindow;
        getScreenName: (player: number, coords: Vector) => string;
    }
    class WorkbenchTileEntity implements WorkbenchPrototype {
        workbench: Workbench;
        currentRecipe: Recipe;
        container: ItemContainer;
        useNetworkItemContainer: true;
        constructor(workbench: Workbench | string);
        setWorkbench(workbench: Workbench | string): void;
        setTransferPolicy(): void;
        getInputSlots(): ItemInstance[];
        getOutputSlot(): ItemInstance;
        validRecipe(slotName?: string, item?: ItemInstance): void;
        init(): void;
        getScreenName(): string;
        getScreenByName(): UI.IWindow;
        registerTileEntity(BlockID: number): void;
    }
    function registerTileEntity(BlockID: number, prototype: WorkbenchPrototype): void;
}
