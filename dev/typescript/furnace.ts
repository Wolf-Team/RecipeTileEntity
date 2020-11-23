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

class MyFurnace extends RecipeTE.TimerWorkbenchTileEntity{
    constructor(sID:string|RecipeTE.Workbench){
        super(sID, false);
    }
    public redstone(params: { power: number, signal: number, onLoad: boolean }){
        if (params.power < 10)
            this.disable();
        else
            this.enable();
    }
}

RecipeTE.registerWorkbench("customFurnace", {
    window: Furnace,
    columns: 1,
    input: ["myInputSlot"],
    output: "myInputSlot",
    time: 5 * 20
});
RecipeTE.addRecipe("Furnace", {id:280}, [{id:5}]);
RecipeTE.addRecipe("Furnace", {id:281}, [{id:1}] /*, .2 */);

RecipeTE.registerTileEntity(BlockID["Furnace"], new MyFurnace("customFurnace"))

// RecipeTE.registerWorkbench({
//     sid:"Furnace",
//     time: 5 * 20, //Время крафта
//     columns: 1, //Кол-во слотов
//     window: Furnace, //Интерфейс печи
//     input: ["myInputSlot"], //Входные слоты
//     output: "myOutputSlot", //Слот результата
//     scale: "timerScale", //Шкала прогресса
// }, {
//     condition: function () { //Условие работы верстака
//         return this.data.power
//     },
//     defaultValues: {
//         power: false,
//     },
//     redstone: function (params) {
//         if (params.power < 10)
//             this.data.power = false;
//         else
//             this.data.power = true;
//     }
// });