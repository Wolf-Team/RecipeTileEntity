IDRegistry.genBlockID("Furnace");
Block.createBlockWithRotation("Furnace", [{
    name: "Furnace",
    texture: [
        ["iron_furnace_bottom", 0], // bottom
        ["iron_furnace_top", 0], // top
        ["iron_furnace_side", 0], // back
        ["iron_furnace_front", 0], // front
        ["iron_furnace_side", 0], // left
        ["iron_furnace_side", 0]  // right
    ],
    inCreative: true
}]);

var Furnace = new UI.StandartWindow({
    standard: {
        header: { text: { text: "Furnace" } },
        inventory: { standard: true },
        background: { standard: true }
    },
    drawing: [{
        type: "bitmap",
        bitmap: "arrow",
        x: 600,
        y: 170,
        scale: 4
    }],
    elements: {
        "myInputSlot": { x: 530, y: 170, type: "slot", scale: 4 },

        "myOutputSlot": {
            x: 698, y: 170, type: "slot",
            // isValid: RecipeTE.outputSlotValid, 
            scale: 4
        },

        "timerScale": {
            type: "scale",
            x: 600,
            y: 170,
            direction: 0,
            bitmap: "arrow_scale",
            scale: 4
        }
    }
});

class CustomFurnace extends RecipeTE.TimerWorkbenchTileEntity {
    constructor(sID: string | RecipeTE.Workbench) {
        super(sID, false);
    }
    // public redstone(params: { power: number, signal: number, onLoad: boolean }){
    //     if (params.power < 10)
    //         this.disable();
    //     else
    //         this.enable();
    // }
}

RecipeTE.registerWorkbench("customFurnace", {
    window: Furnace,
    columns: 1,
    input: ["myInputSlot"],
    output: "myOutputSlot",
    scale: "timerScale",
    time: 5 * 20
});
RecipeTE.addRecipe("customFurnace", { id: 280 }, [{ id: 5 }]);
RecipeTE.addRecipe("customFurnace", { id: 281 }, [{ id: 1 }] /*, .2 */);

RecipeTE.registerTileEntity(BlockID["Furnace"], new CustomFurnace("customFurnace"))