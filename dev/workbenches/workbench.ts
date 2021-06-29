IDRegistry.genBlockID("Workbench_Grid");
Block.createBlock("Workbench_Grid", [{
    name: "Workbench Grid",
    texture: [
        ["work_table_bottom", 0], // bottom
        ["work_table_top", 0], // top
        ["work_table_side", 0], // back
        ["work_table_side", 1], // front
        ["work_table_side", 0], // left
        ["work_table_side", 0]  // right
    ],
    inCreative: true
}]);

var Workbench_Grid: UI.StandardWindow = new UI.StandardWindow({
    standard: {
        header: { text: { text: "Workbench Grid 4x4" } },
        inventory: {
            width: 300,
            padding: 20
        },
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
        "inputSlot0": { x: 350, y: 80, type: "slot", size: 60 },
        "inputSlot1": { x: 410, y: 80, type: "slot", size: 60 },
        "inputSlot2": { x: 470, y: 80, type: "slot", size: 60 },
        "inputSlot3": { x: 530, y: 80, type: "slot", size: 60 },

        "inputSlot4": { x: 350, y: 140, type: "slot", size: 60 },
        "inputSlot5": { x: 410, y: 140, type: "slot", size: 60 },
        "inputSlot6": { x: 470, y: 140, type: "slot", size: 60 },
        "inputSlot7": { x: 530, y: 140, type: "slot", size: 60 },

        "inputSlot8": { x: 350, y: 200, type: "slot", size: 60 },
        "inputSlot9": { x: 410, y: 200, type: "slot", size: 60 },
        "inputSlot10": { x: 470, y: 200, type: "slot", size: 60 },
        "inputSlot11": { x: 530, y: 200, type: "slot", size: 60 },

        "inputSlot12": { x: 350, y: 260, type: "slot", size: 60 },
        "inputSlot13": { x: 410, y: 260, type: "slot", size: 60 },
        "inputSlot14": { x: 470, y: 260, type: "slot", size: 60 },
        "inputSlot15": { x: 530, y: 260, type: "slot", size: 60 },

        "outputSlot": { x: 698, y: 170, type: "slot", size: 60 }
    }
});

const MyWorkbench = new RecipeTE.Workbench({
    columns: 4,
    rows: 4
})
    .addShapeRecipe(
        { id: 280, count: 1 },
        [
            "aa",
            "aa"
        ],
        {
            a: { id: 5 }
        }
    )
    .addShapeRecipe(
        { id: 1 },
        "aaaa",
        { a: { id: 5 } }
    )
    .addRecipe(
        { id: 2 },
        [
            { id: 5, count: 3 }
        ]
    );

class MyWorkbenchTileEntity extends RecipeTE.WorkbenchTileEntity {
    public getScreenName() { return "main"; }
    public getScreenByName() { return Workbench_Grid; }
    public getInputSlots(): string { return "inputSlot"; }
    public getOutputSlot(): string { return "outputSlot"; }
}

TileEntity.registerPrototype(BlockID["Workbench_Grid"], new MyWorkbenchTileEntity(MyWorkbench));

// RecipeTE.registerWorkbench("customWorkbench", {
//     window: Workbench_Grid,
//     columns: 4,
//     rows: 4
// }).addShapeRecipe(
//     { id: 280, count: 1 },
//     [
//         "aa",
//         "aa"
//     ],
//     {
//         a: { id: 5 }
//     }
// )
// .addShapeRecipe(
//     { id: 1 },
//     "aaaa",
//     { a: { id: 5 } }
// )
// .addRecipe(
//     { id: 2 },
//     [
//         { id: 5, count: 3 }
//     ]
// );

// RecipeTE.registerTileEntity(BlockID["Workbench_Grid"], new RecipeTE.WorkbenchTileEntity("customWorkbench"))