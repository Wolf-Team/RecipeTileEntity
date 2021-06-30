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
            size: 60
        },
        "myOutputSlot": {
            type: "slot",
            x: 698, y: 170,
            size: 60
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
            size: 60
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

const MyFurnace = new RecipeTE.TimerWorkbench({
    columns: 1,
    timer: 5 * 20
}, { multiply: 1 })
    .addRecipe({ id: 280 }, [{ id: 5 }])
    .addRecipe({ id: 281 }, [{ id: 1 }], { multiply: 2 });

class MyFurnaceTileEntity extends RecipeTE.TimerWorkbenchTileEntity {
    constructor(workbench: RecipeTE.Workbench) {
        super(workbench, false);
        this.defaultValues.duration = 0;
        this.defaultValues.currentDuration = 0;
    }

    getScreenName(): string { return "main"; }
    getScreenByName(): Windows { return Furnace; }
    getInputSlots(): string[] { return ["myInputSlot"]; }
    getOutputSlot(): string { return "myOutputSlot"; }
    getScale(): string { return "timerScale"; }

    public init() {
        super.init();

        this.container.setSlotAddTransferPolicy("fuelSlot", function (container, name, id, amount, data) {
            var self: MyFurnaceTileEntity = container.getParent();
            let dur = Recipes.getFuelBurnDuration(id, data);
            if (dur > 0) {
                self.enable();
                return amount;
            }
            return 0;
        });
    }

    public tick() {
        if (this.isEnabled()) {
            if (this.data.currentDuration) {
                this.data.currentDuration--;
            } else {
                let fuel = this.container.getSlot("fuelSlot");
                if (fuel.count != 0) {
                    this.setBurnDuration(Recipes.getFuelBurnDuration(fuel.id, fuel.data));
                    let c = fuel.count - 1;
                    if (c)
                        this.container.setSlot("fuelSlot", fuel.id, c, fuel.data, fuel.extra);
                    else
                        this.container.setSlot("fuelSlot", 0, 0, 0);
                } else {
                    this.disable();
                }
            }
        }

        this.container.setScale("fuelScale", this.data.currentDuration / this.data.duration || 0);

        super.tick();
    }

    public setBurnDuration(duration: number) {
        this.data.currentDuration = this.data.duration = duration;
    }
}

TileEntity.registerPrototype(BlockID["Furnace"], new MyFurnaceTileEntity(MyFurnace));