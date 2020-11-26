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
    drawing: [
        {
            type: "bitmap",
            bitmap: "arrow",
            x: 600, y: 170,
            scale: 4
        },
        {
            type: "bitmap",
            bitmap: "fire",
            x: 534, y: 174,
            scale: 4
        }
    ],
    elements: {
        "myInputSlot": {
            type: "slot",
            x: 530, y: 110,
            scale: 4
        },
        "myOutputSlot": {
            type: "slot",
            x: 698, y: 170, 
            scale: 4
        },
        "timerScale": {
            type: "scale",
            x: 600, y: 170,
            direction: 0,
            bitmap: "arrow_scale",
            scale: 4
        },

        "fuelSlot": {
            type: "slot",
            x: 530, y: 170 + 16 * 4,
            scale: 4
        },
        "fuelScale": {
            type: "scale",
            x: 534, y: 174,
            direction: 1,
            bitmap: "fire_scale",
            scale: 4
        }
    }
});

class CustomFurnace extends RecipeTE.TimerWorkbenchTileEntity {
    constructor(sID: string | RecipeTE.Workbench) {
        super(sID, false);
        this.defaultValues.duration = 0;
        this.defaultValues.currentDuration = 0;
    }

    public init(){
        super.init();
        
        this.container.setSlotAddTransferPolicy("fuelSlot", function(container, name, id, amount, data){
            var self:CustomFurnace = container.getParent();
            let dur = Recipes.getFuelBurnDuration(id, data);
            if(dur > 0){
                self.enable();
                return amount;
            }
            return 0;
        });
    }

    public tick(){
        super.tick();

        if(this.isEnabled()){
            if(this.data.currentDuration){
                this.data.currentDuration--;
            }else{
                let fuel = this.container.getSlot("fuelSlot");
                if(fuel.count != 0){
                    this.setBurnDuration(Recipes.getFuelBurnDuration(fuel.id, fuel.data));
                    this.container.setSlot("fuelSlot", fuel.id, fuel.count-1, fuel.data, fuel.extra);
                }
            }
        }
        
        this.container.setScale("fuleScale", this.data.currentDuration / this.data.duration);
        this.container.sendChanges();
    }

    public setBurnDuration(duration:number){
        this.defaultValues.currentDuration = this.data.duration = duration;
    }
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