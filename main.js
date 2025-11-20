import * as helper from "./helper.js";

let plane = document.getElementById("plane");
let world = document.getElementById("world");
let canvas = document.getElementById("canvas");

canvas.width = window.innerWidth; canvas.height = window.innerHeight;
let draw_context = canvas.getContext("2d");
draw_context.lineWidth = 3;
let wire_comp_selected = false;
let wire_start_pos = [];
let wire_end_pos = [];
let first_sel_comp = null;
let second_sel_comp = null;

let current_mode_num = 0;
let current_mode = helper.modes[current_mode_num];
world.style.cursor = current_mode.cursor;

let components = [];

let selected_component_num = [0, 0];
let cursor_component = new helper.And(document.createElement("img"));
cursor_component.img_tag.src = "Assets/" + helper.element_arr[0][0] + ".png";
cursor_component.img_tag.id = "cursor_img";
cursor_component.img_tag.className = `${helper.element_ord[0]}`;
cursor_component.img_tag.classList.add(`${helper.element_arr[selected_component_num[0]][selected_component_num[1]]}`);
plane.appendChild(cursor_component.img_tag);

document.addEventListener("mousemove", handle_mousemove);
document.addEventListener("keydown", handle_keydown);
document.addEventListener("dblclick", handle_dblclick);
document.addEventListener("click", handle_click);

function handle_click(event) {
    if (current_mode == helper.arrangement) {
        place_component([event.x, event.y]);
    } else if (current_mode == helper.connections) {
        place_wire([event.x, event.y]);
    } else if (current_mode == helper.interaction) {
        interact_components([event.x, event.y]);
    }
}

function handle_dblclick(event) {
    if (current_mode == helper.arrangement) {
        remove_component([event.x, event.y]);
    }
}

function handle_keydown(event) {
    if (current_mode == helper.arrangement) {
        component_selection(event);
    }
    mode_change(event);
}

function handle_mousemove(event) {
    if (current_mode == helper.arrangement) {
        cursor_image_projection(event);
    } else if (current_mode == helper.interaction) {
        update_components();
    }
}

function mode_change(event) {
    if (event.key == 't') {
        if (current_mode == helper.arrangement) {
            cursor_component.img_tag.style.visibility = "hidden";
        }

        current_mode_num += 1;
        current_mode_num = helper.correct_selection_index(current_mode_num, helper.modes);
        current_mode = helper.modes[current_mode_num];

        if (current_mode == helper.arrangement) {
            cursor_component.img_tag.style.visibility = "visible";
        }
        world.style.cursor = current_mode.cursor;
    }
}

function interact_components(cursor_pos) {
    let collided_obj = helper.point_to_objArr_collision(cursor_pos, components.map(value => value.img_tag)).collided_with;
        if (collided_obj != null) {
            collided_obj = components.at(components.map(value => value.img_tag).indexOf(collided_obj));
            if (collided_obj.classes[1] == "switch") {
                collided_obj.change_val();
            }
        }
}

function update_components() {
    for (let index = 0; index < components.length; index++) {
        if (components[index].classes[0] == "output") {
            components[index].compute();
        }
    }
}

function determine_connections(first_comp, start_pos, second_comp, end_pos, context) {
    if (first_comp == second_comp) return;
    let line_start, line_end;

    if (first_comp.classes[0] == "input" && second_comp.classes[0] != "input") {
        second_comp.inputs.push(first_comp);

        line_end = [end_pos[0] + 0,
                    end_pos[1] + second_comp.img_tag.height / 2];
        if (start_pos[1] < end_pos[1]) {
            line_start = [start_pos[0] + first_comp.img_tag.width / 2,
                          start_pos[1] + 0];
        } else {
            line_start = [start_pos[0] + first_comp.img_tag.width / 2,
                          start_pos[1] + first_comp.img_tag.height];
        }
    }
    else if (second_comp.classes[0] == "input" && first_comp.classes[0] != "input") {
        first_comp.inputs.push(second_comp);

        line_end = [start_pos[0] + 0,
                    start_pos[1] + first_comp.img_tag.height / 2];
        if (start_pos[1] < end_pos[1]) {
            line_start = [end_pos[0] + second_comp.img_tag.width / 2,
                          end_pos[1] + 0];
        } else {
            line_start = [end_pos[0] + second_comp.img_tag.width / 2,
                          end_pos[1] + second_comp.img_tag.height];
        }
    }
    else if (first_comp.classes[0] == "output" && second_comp.classes[0] != "output") {
        first_comp.inputs.push(second_comp);

        line_end = [end_pos[0] + second_comp.img_tag.width,
                    end_pos[1] + second_comp.img_tag.height / 2];
        if (start_pos[1] < end_pos[1]) {
            line_start = [start_pos[0] + first_comp.img_tag.width / 2,
                          start_pos[1] + 0];
        } else {
            line_start = [start_pos[0] + first_comp.img_tag.width / 2,
                          start_pos[1] + first_comp.img_tag.height];
        }
    }
    else if (second_comp.classes[0] == "output" && first_comp.classes[0] != "output") {
        second_comp.inputs.push(first_comp);

        line_end = [start_pos[0] + first_comp.img_tag.width,
                    start_pos[1] + first_comp.img_tag.height / 2];
        if (start_pos[1] < end_pos[1]) {
            line_start = [end_pos[0] + second_comp.img_tag.width / 2,
                          end_pos[1] + 0];
        } else {
            line_start = [end_pos[0] + second_comp.img_tag.width / 2,
                          end_pos[1] + second_comp.img_tag.height];
        }
    }
    else if (first_comp.classes[0] == "gate" && second_comp.classes[0] == "gate") {
        if (start_pos[0] > end_pos[0]) {
            first_comp.inputs.push(second_comp);

            line_start = [start_pos[0] + 0,
                          start_pos[1] + first_comp.img_tag.height / 2];
            line_end = [end_pos[0] + second_comp.img_tag.width,
                        end_pos[1] + second_comp.img_tag.height / 2];
        } else {
            second_comp.inputs.push(first_comp);

            line_start = [end_pos[0] + 0,
                          end_pos[1] + second_comp.img_tag.height / 2];
            line_end = [start_pos[0] + first_comp.img_tag.width,
                        start_pos[1] + first_comp.img_tag.height / 2];
        }
    }

    helper.draw_step(context, line_start, line_end);
}

function place_wire(cursor_pos) {
    let col_obj = helper.point_to_objArr_collision(cursor_pos, components.map(value => value.img_tag)).collided_with;
    if (col_obj != null) {
        if (!wire_comp_selected) {
            first_sel_comp = components[helper.get_comp_index_by_img(col_obj, components)];
            wire_start_pos = helper.get_obj_position(col_obj);
            wire_comp_selected = true;
        } else {
            second_sel_comp = components[helper.get_comp_index_by_img(col_obj, components)];;
            wire_end_pos = helper.get_obj_position(col_obj);

            determine_connections(first_sel_comp, wire_start_pos,
                                  second_sel_comp, wire_end_pos,
                                  draw_context);
            wire_comp_selected = false;
        }
    }
}

function remove_component() {
    let collided_obj = helper.obj_to_objArr_collision(cursor_component.img_tag, components.map(value => value.img_tag)).collided_with;
    if (collided_obj != null) {
        plane.removeChild(collided_obj);
        components.splice(helper.get_comp_index_by_img(collided_obj, components), 1);
    }
}

function place_component(cursor_pos) {
    if (!helper.obj_to_objArr_collision(cursor_component.img_tag, components.map(value => value.img_tag)).collided) {
        let img = document.createElement("img");
        plane.appendChild(img);
        img.src = cursor_component.img_tag.src;
        img.className = cursor_component.img_tag.className;
        img.style.objectPosition = `${cursor_pos[0] - img.width / 2}px 
                                    ${cursor_pos[1] - img.height / 2}px`;
        let type = img.classList.value.split(" ")[1];
        let component = null;
        if (type == "switch") {
            component = new helper.Switch("Assets/switch_on.png",
                                          "Assets/switch_off.png",
                                          img);
        } else if (type == "bulb") {
            component = new helper.Bulb("Assets/bulb_on.png",
                                        "Assets/bulb_off.png",
                                        img);
        } else if (type == "and") {
            component = new helper.And(img);
        } else if (type == "or") {
            component = new helper.Or(img);
        } else if (type == "not") {
            component = new helper.Not(img);
        } else if (type == "nor") {
            component = new helper.Nor(img);
        } else if (type == "nand") {
            component = new helper.Nand(img);
        }
        components.push(component);
    }
}

function component_selection(event) {
    if (event.key.startsWith("Arrow")) {
        switch(event.key) {
            case "ArrowUp":
                selected_component_num[0] -= 1;
                break;
            case "ArrowDown":
                selected_component_num[0] += 1;
                break;
            case "ArrowLeft":
                selected_component_num[1] -= 1;
                break;
            case "ArrowRight":
                selected_component_num[1] += 1;
                break;
        }
    }

    selected_component_num[0] = helper.correct_selection_index(selected_component_num[0], helper.element_arr);
    selected_component_num[1] = helper.correct_selection_index(selected_component_num[1], helper.element_arr[selected_component_num[0]]);

    cursor_component.img_tag.className = `${helper.element_ord[selected_component_num[0]]}`;
    cursor_component.img_tag.classList.add(`${helper.element_arr[selected_component_num[0]][selected_component_num[1]]}`);
    cursor_component.img_tag.src = "Assets/" + helper.element_arr[selected_component_num[0]][selected_component_num[1]] + ".png";
}

function cursor_image_projection(event) {
    cursor_component.img_tag.style.objectPosition = `${event.x - cursor_component.img_tag.width / 2}px 
                                                     ${event.y - cursor_component.img_tag.height / 2}px`;
}