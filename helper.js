let input_arr = ["switch"],
    gate_arr = ["and", "nand", "nor", "not", "or"],
    output_arr = ["bulb"];

export let element_arr = [input_arr,
                          gate_arr,
                          output_arr];

export let element_ord = ["input",
                          "gate",
                          "output"];

export let arrangement = {
                            cursor : "default"
                         },
           interaction = {
                            cursor : "pointer"
                         },
           connections = {
                            cursor : "crosshair"
                         };

export let modes = [arrangement,
                    connections,
                    interaction];

export function get_comp_index_by_img(img_tag, comp_arr) {
    return comp_arr.map(value => value.img_tag).indexOf(img_tag);
}

export function draw_step(draw_context, start_pos, end_pos) {
    draw_context.beginPath();
    draw_context.moveTo(start_pos[0], start_pos[1]);
    draw_context.lineTo(start_pos[0], end_pos[1]);
    draw_context.stroke();
        
    draw_context.beginPath();
    draw_context.moveTo(start_pos[0], end_pos[1]);
    draw_context.lineTo(end_pos[0], end_pos[1]);
    draw_context.stroke();
}

export function correct_selection_index(current_index, array) {
    if (current_index < 0) {
        return array.length - 1;
    }
    else if (current_index >= array.length) {
        return 0;
    }
    else {
        return current_index;
    }
}

export function obj_to_objArr_collision(obj, objArr) {
    let collided = false;
    let collided_with = null;
    for (let index = 0; index < objArr.length; index++) {
        if (obj_to_obj_collision(obj, objArr[index])) {
            collided = true;
            collided_with = objArr[index];
            break;
        }
    }
    return {
        collided : collided, 
        collided_with : collided_with
    };
}

export function point_to_objArr_collision(point, objArr) {
    let collided = false;
    let collided_with = null;
    for (let index = 0; index < objArr.length; index++) {
        if (point_to_obj_collision(point, objArr[index])) {
            collided = true;
            collided_with = objArr[index];
            break;
        }
    }
    return {
        collided : collided, 
        collided_with : collided_with
    };
}

function obj_to_obj_collision(obj1, obj2) {
    return (
        obj_contains_obj_collision(obj1, obj2) ||
        obj_contains_obj_collision(obj2, obj1)
    );
}

function obj_contains_obj_collision(obj1, obj2) {
    let obj2_topleft = get_obj_position(obj2);
    let obj2_topright = [obj2_topleft[0], obj2_topleft[1] + obj2.width];
    let obj2_bottomleft = [obj2_topleft[0] + obj2.height, obj2_topleft[1]];
    let obj2_bottomright = [obj2_topleft[0] + obj2.width, obj2_topleft[1] + obj2.width];

    return (
        point_to_obj_collision(obj2_topleft, obj1) ||
        point_to_obj_collision(obj2_topright, obj1) ||
        point_to_obj_collision(obj2_bottomleft, obj1) ||
        point_to_obj_collision(obj2_bottomright, obj1)
    );
}

function point_to_obj_collision(point, obj) {
    let img_pos = get_obj_position(obj);
    return (
        point[0] > img_pos[0] &&
        point[0] < img_pos[0] + obj.width &&
        point[1] > img_pos[1] &&
        point[1] < img_pos[1] + obj.height
    );
}

export function get_obj_position(obj) {
    let pos_string = obj.style.objectPosition;;
    let x = Number(pos_string.split(" ")[0].split("p")[0]);
    let y = Number(pos_string.split(" ")[1].split("p")[0]);
    return [x, y];  
}

export class Bulb {
    constructor(on_img, off_img, img_tag) {
        this.on_img = on_img;
        this.off_img = off_img;
        this.img_tag = img_tag;
        this.classes = this.img_tag.className.split(" ");
        this.inputs = [];
        this.value = false;
    }

    update() {
        if (this.value) {
            this.img_tag.src = this.on_img;
        } else {
            this.img_tag.src = this.off_img;
        }
    }

    compute() {
        this.value = false;
        for (let index = 0; index < this.inputs.length; index++) {
            if (this.inputs[index].classes[0] == "gate") {
                this.inputs[index].compute();
            }
            
            if (this.inputs[index].value) {
                this.value = true;
            }
        }

        this.update();
    }
}

export class Switch {
    constructor(on_img, off_img, img_tag) {
        this.on_img = on_img;
        this.off_img = off_img;
        this.img_tag = img_tag;
        this.classes = this.img_tag.className.split(" ");
        this.value = false;
    }

    update() {
        if (this.value) {
            this.img_tag.src = this.on_img;
        } else {
            this.img_tag.src = this.off_img;
        }
    }

    change_val() {
        this.value = !(this.value);
        this.update();
    }
}

export class And {
    constructor(img_tag) {
        this.img_tag = img_tag;
        this.classes = this.img_tag.className.split(" ");
        this.inputs = [];
        this.value = false;
    }

    compute() {
        this.value = true;
        for (let index = 0; index < this.inputs.length; index++) {
            if (this.inputs[index].classes[0] == "gate") {
                this.inputs[index].compute();
            }
            if (!this.inputs[index].value) {
                this.value = false;
            }
        }
    }
}

export class Nand {
    constructor(img_tag) {
        this.img_tag = img_tag;
        this.classes = this.img_tag.className.split(" ");
        this.inputs = [];
        this.value = false;
    }

    compute() {
        this.value = false;
        for (let index = 0; index < this.inputs.length; index++) {
            if (this.inputs[index].classes[0] == "gate") {
                this.inputs[index].compute();
            }
            if (!(this.inputs[index].value)) {
                this.value = true;
            }
        }
    }
}

export class Nor {
    constructor(img_tag) {
        this.img_tag = img_tag;
        this.classes = this.img_tag.className.split(" ");
        this.inputs = [];
        this.value = false;
    }

    compute() {
        this.value = true;
        for (let index = 0; index < this.inputs.length; index++) {
            if (this.inputs[index].classes[0] == "gate") {
                this.inputs[index].compute();
            }
            if (this.inputs[index].value) {
                this.value = false;
            }
        }
    }
}

export class Not {
    constructor(img_tag) {
        this.img_tag = img_tag;
        this.classes = this.img_tag.className.split(" ");
        this.inputs = [];
        this.value = true;
    }

    compute() {
        if (this.inputs[this.inputs.length - 1].classes[0] == "gate") {
            this.inputs[this.inputs.length - 1].compute();
        }
        this.value = !(this.inputs[this.inputs.length - 1].value);
    }
}

export class Or {
    constructor(img_tag) {
        this.img_tag = img_tag;
        this.classes = this.img_tag.className.split(" ");
        this.inputs = [];
        this.value = false;
    }

    compute() {
        this.value = false;
        for (let index = 0; index < this.inputs.length; index++) {
            if (this.inputs[index].classes[0] == "gate") {
                this.inputs[index].compute();
            }
            if (this.inputs[index].value) {
                this.value = true;
            }
        }
    }
}