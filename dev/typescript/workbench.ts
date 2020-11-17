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
        header: {text: {text: "Workbench Grid 4x4"}},
        inventory: {
            width:300,
            padding:20
        },
        background: {standard: true}
    },
    drawing: [{
        type: "bitmap",
        bitmap: "arrow",
        x: 600,
        y: 170,
        scale: 4
    }],
    elements:{
        "inputSlot0":{x:350, y:80, type:"slot", scale:4},
        "inputSlot1":{x:410, y:80, type:"slot", scale:4},
        "inputSlot2":{x:470, y:80, type:"slot", scale:4},
        "inputSlot3":{x:530, y:80, type:"slot", scale:4},

        "inputSlot4":{x:350, y:140, type:"slot", scale:4},
        "inputSlot5":{x:410, y:140, type:"slot", scale:4},
        "inputSlot6":{x:470, y:140, type:"slot", scale:4},
        "inputSlot7":{x:530, y:140, type:"slot", scale:4},

        "inputSlot8":{x:350, y:200, type:"slot", scale:4},
        "inputSlot9":{x:410, y:200, type:"slot", scale:4},
        "inputSlot10":{x:470, y:200, type:"slot", scale:4},
        "inputSlot11":{x:530, y:200, type:"slot", scale:4},

        "inputSlot12":{x:350, y:260, type:"slot", scale:4},
        "inputSlot13":{x:410, y:260, type:"slot", scale:4},
        "inputSlot14":{x:470, y:260, type:"slot", scale:4},
        "inputSlot15":{x:530, y:260, type:"slot", scale:4},

        "outputSlot":{x:698, y:170, type:"slot", scale:4}
    }
});


class MyWorkbench extends RecipeTE.Workbench{}

//.
//addRecipe();
let myWorkbench = new MyWorkbench();

alert(myWorkbench.init);

RecipeTE.registerWorkbench({
    sid:"Workbench_Grid",
    cols:4,
    rows:4,
    window:Workbench_Grid
}, myWorkbench);

// RecipeTE.registerWorkbench({
//     sid:"Workbench_Grid",
//     columns:4,
//     rows:4,
//     window:Workbench_Grid
// }, new RecipeTE.Workbench());