// @ts-nocheck
import date_utils from './src/date_utils';
import {$, createSVG} from './src/svg_utils';
import Bar from './src/bar';
import Arrow from './src/arrow';
import Popup from './src/popup';

import './src/gantt.scss';
import {Task} from "frappe-gantt";

const VIEW_MODE = {
    QUARTER_DAY: 'Quarter Day',
    HALF_DAY: 'Half Day',
    DAY: 'Day',
    WEEK: 'Week',
    MONTH: 'Month',
    YEAR: 'Year',
};

export default class Gantt {
    private $svg: any;
    private $container: any;
    private popup_wrapper: any;
    private options: any;
    private tasks: any;
    private dependency_map: any;
    private gantt_start: any;
    private gantt_end: any;
    private dates: any;
    private layers: any;
    private bars: any;
    private arrows: any;
    private bar_being_dragged: null;
    private popup: any;
    static VIEW_MODE: any;

    private $header: any;
    private header_layers: any;
    private $header_container: any;

    constructor(wrapper, tasks, options) {
        this.setup_options(options);
        this.setup_wrapper(wrapper);
        this.setup_tasks(tasks);
        // initialize with default view mode
        this.change_view_mode();
        this.bind_events();
    }

    setup_wrapper(element) {
        let svg_element, header_element;

        // CSS Selector is passed
        // if (typeof element === 'string') {
        //     element = document.querySelector(element);
        // }
        //
        // // get the SVGElement
        // if (element instanceof HTMLElement) {
        //     wrapper_element = element;
        //     svg_element = element.querySelector('svg');
        // } else if (element instanceof SVGElement) {
        //     svg_element = element;
        // } else {
        //     throw new TypeError(
        //         'Frappé Gantt only supports usage of a string CSS selector,' +
        //         " HTML DOM element or SVG DOM element for the 'element' parameter"
        //     );
        // }

        element = document.querySelector(element);
        const element2 = document.querySelector(this.options.gantt_head);

        if (!element || !element2) {
            throw new TypeError(
                    'Frappé Gantt only supports usage of a string CSS selector,' +
                    " HTML DOM element or SVG DOM element for the 'element' parameter"
                );
        }


        svg_element = element.querySelector('.gantt');
        header_element = element2.querySelector('.gantt-header');


        // svg element
        if (!svg_element) {
            // create it
            this.$svg = createSVG('svg', {
                append_to: element,
                class: 'gantt',
            });
        } else {
            this.$svg = svg_element;
            this.$svg.classList.add('gantt');
        }

        // header element
        if (!header_element) {
            // create it
            this.$header = createSVG('svg', {
                append_to: element2,
                class: 'gantt-header',
            });
        } else {
            this.$header = header_element;
            this.$header.classList.add('gantt-header');
        }

        // wrapper element
        this.$container = document.createElement('div');
        this.$container.classList.add('gantt-container');

        const parent_element = this.$svg.parentElement;
        parent_element.appendChild(this.$container);
        this.$container.appendChild(this.$svg);

        // header wrapper element
        this.$header_container = document.createElement('div');
        this.$header_container.classList.add('gantt-container');

        const header_parent_element = this.$header.parentElement;
        header_parent_element.appendChild(this.$header_container);
        this.$header_container.appendChild(this.$header);


        // popup wrapper
        this.popup_wrapper = document.createElement('div');
        this.popup_wrapper.classList.add('popup-wrapper');
        this.$container.appendChild(this.popup_wrapper);
    }

    setup_options(options) {
        const default_options = {
            header_height: 0,
            column_width: 30,
            step: 24,
            view_modes: [...Object.values(VIEW_MODE)],
            bar_height: 20,
            bar_corner_radius: 3,
            arrow_curve: 5,
            padding: 18,
            view_mode: 'Day',
            date_format: 'YYYY-MM-DD',
            popup_trigger: 'click',
            custom_popup_html: null,
            language: 'en',
        };
        this.options = Object.assign({}, default_options, options);
    }

    setup_tasks(tasks) {
        // prepare tasks
        this.tasks = tasks.map((task, i) => {
            // convert to Date objects
            task._start = date_utils.parse(task.start);
            task._end = date_utils.parse(task.end);

            // make task invalid if duration too large
            if (date_utils.diff(task._end, task._start, 'year') > 10) {
                task.end = null;
            }

            // cache index
            task._index = i;

            // invalid dates
            if (!task.start && !task.end) {
                const today = date_utils.today();
                task._start = today;
                task._end = date_utils.add(today, 2, 'day');
            }

            if (!task.start && task.end) {
                task._start = date_utils.add(task._end, -2, 'day');
            }

            if (task.start && !task.end) {
                task._end = date_utils.add(task._start, 2, 'day');
            }

            // if hours is not set, assume the last day is full day
            // e.g: 2018-09-09 becomes 2018-09-09 23:59:59
            const task_end_values = date_utils.get_date_values(task._end);
            if (task_end_values.slice(3).every((d) => d === 0)) {
                task._end = date_utils.add(task._end, 24, 'hour');
            }

            // invalid flag
            if (!task.start || !task.end) {
                task.invalid = true;
            }

            // dependencies
            if (typeof task.dependencies === 'string' || !task.dependencies) {
                let deps = [];
                if (task.dependencies) {
                    deps = task.dependencies
                        .split(',')
                        .map((d) => d.trim())
                        .filter((d) => d);
                }
                task.dependencies = deps;
            }

            // uids
            if (!task.id) {
                task.id = generate_id(task);
            }

            return task;
        });

        this.setup_dependencies();
    }

    setup_dependencies() {
        this.dependency_map = {};
        for (let t of this.tasks) {
            for (let d of t.dependencies) {
                this.dependency_map[d] = this.dependency_map[d] || [];
                this.dependency_map[d].push(t.id);
            }
        }
    }

    refresh(tasks) {
        this.setup_tasks(tasks);
        this.change_view_mode();
    }

    change_view_mode(mode = this.options.view_mode) {
        this.update_view_scale(mode);
        this.setup_dates();
        this.render();
        // fire viewmode_change event
        this.trigger_event('view_change', [mode]);
    }

    update_view_scale(view_mode) {
        this.options.view_mode = view_mode;

        if (view_mode === VIEW_MODE.DAY) {
            this.options.step = 24;
            this.options.column_width = 100;
        } else if (view_mode === VIEW_MODE.HALF_DAY) {
            this.options.step = 24 / 2;
            this.options.column_width = 38;
        } else if (view_mode === VIEW_MODE.QUARTER_DAY) {
            this.options.step = 1;
            this.options.column_width = 50;
        } else if (view_mode === VIEW_MODE.WEEK) {
            this.options.step = 24 * 7;
            this.options.column_width = 140;
        } else if (view_mode === VIEW_MODE.MONTH) {
            this.options.step = 24 * 30;
            this.options.column_width = 120;
        } else if (view_mode === VIEW_MODE.YEAR) {
            this.options.step = 24 * 365;
            this.options.column_width = 120;
        }
    }

    setup_dates() {
        this.setup_gantt_dates();
        this.setup_date_values();
    }

    setup_gantt_dates() {
        let currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        let lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        lastDayOfMonth.setDate(lastDayOfMonth.getDate() - 1);

        this.gantt_start = this.options.start
        this.gantt_end = this.options.end


        for (let task of this.tasks) {
            // set global start and end date
            if (!this.gantt_start || task._start < this.gantt_start) {
                this.gantt_start = task._start;
            }
            if (!this.gantt_end || task._end > this.gantt_end) {
                this.gantt_end = task._end;
            }
        }

        this.gantt_start = date_utils.start_of(this.gantt_start, 'day');
        this.gantt_end = date_utils.start_of(this.gantt_end, 'day');

        // add date padding on both sides
        if (this.view_is(VIEW_MODE.MONTH)) {
            this.gantt_start = date_utils.start_of(this.gantt_start, 'year');
            this.gantt_end = date_utils.add(this.gantt_end, 1, 'year');
        }


        // if (this.view_is([VIEW_MODE.QUARTER_DAY, VIEW_MODE.HALF_DAY])) {
        //     this.gantt_start = date_utils.add(this.gantt_start, -3, 'day');
        //     this.gantt_end = date_utils.add(this.gantt_end, 3, 'day');
        // } else if (this.view_is(VIEW_MODE.MONTH)) {
        //     this.gantt_start = date_utils.start_of(this.gantt_start, 'year');
        //     this.gantt_end = date_utils.add(this.gantt_end, 1, 'year');
        // } else if (this.view_is(VIEW_MODE.YEAR)) {
        //     this.gantt_start = date_utils.add(this.gantt_start, -2, 'year');
        //     this.gantt_end = date_utils.add(this.gantt_end, 2, 'year');
        // } else {
        //     this.gantt_start = date_utils.add(this.gantt_start, -1, 'month');
        //     this.gantt_end = date_utils.add(this.gantt_end, 1, 'month');
        // }
    }

    setup_date_values() {
        this.dates = [];
        let cur_date = null;

        while (cur_date === null || cur_date < this.gantt_end) {
            if (!cur_date) {
                cur_date = date_utils.clone(this.gantt_start);
            } else {
                if (this.view_is(VIEW_MODE.YEAR)) {
                    cur_date = date_utils.add(cur_date, 1, 'year');
                } else if (this.view_is(VIEW_MODE.MONTH)) {
                    cur_date = date_utils.add(cur_date, 1, 'month');
                } else {
                    cur_date = date_utils.add(
                        cur_date,
                        this.options.step,
                        'hour'
                    );
                }
            }
            this.dates.push(cur_date);
        }
    }

    bind_events() {
        this.bind_grid_click();
        this.bind_bar_events();
        this.bind_scroll();
    }

    render() {
        this.clear();
        this.setup_layers();
        this.make_grid();
        this.make_dates();
        this.make_bars();
        this.make_arrows();
        this.map_arrows_on_bars();
        this.set_width();
        this.set_scroll_position();
    }

    setup_layers() {
        this.layers = {};
        this.header_layers = {};
        const layers = ['grid', 'date', 'arrow', 'progress', 'bar', 'details'];
        // make group layers
        for (let layer of layers) {
            this.layers[layer] = createSVG('g', {
                class: layer,
                append_to: this.$svg,
            });

            this.header_layers[layer] = createSVG('g', {
                class: layer,
                append_to: this.$header,
            });
        }
    }

    make_grid() {
        this.make_grid_background();
        this.make_grid_rows();
        this.make_grid_header();
        this.make_grid_ticks();
        this.make_grid_highlights();
    }

    make_grid_background() {
        const grid_width = this.dates.length * this.options.column_width;
        const grid_height =  (this.options.bar_height + this.options.padding) * this.tasks.length;

        createSVG('rect', {
            x: 0,
            y: 0,
            width: grid_width,
            height: grid_height,
            class: 'grid-background',
            append_to: this.layers.grid,
        });

        $.attr(this.$svg, {
            height: grid_height  + 100,
            width: '100%',
        });

        $.attr(this.$header, {
            height: 60,
            width: '100%',
        });
    }

    make_grid_rows() {
        const rows_layer = createSVG('g', {append_to: this.layers.grid});
        const lines_layer = createSVG('g', {append_to: this.layers.grid});

        const row_width = this.dates.length * this.options.column_width;
        const row_height = this.options.bar_height + this.options.padding;

        let row_y = this.options.header_height;

        for (let task of this.tasks) {
            createSVG('rect', {
                x: 0,
                y: row_y,
                width: row_width,
                height: row_height,
                class: 'grid-row',
                append_to: rows_layer,
            });

            createSVG('line', {
                x1: 0,
                y1: row_y + row_height,
                x2: row_width,
                y2: row_y + row_height,
                class: 'row-line',
                append_to: lines_layer,
            });

            row_y += this.options.bar_height + this.options.padding;
        }
    }

    make_grid_header() {
        return
        const header_width = this.dates.length * this.options.column_width;
        const header_height = 0;
        createSVG('rect', {
            x: 0,
            y: 0,
            width: header_width,
            height: header_height,
            class: 'grid-header',
            append_to: this.layers.grid,
        });
    }

    make_grid_ticks() {
        let tick_x = 0;
        let tick_y = this.options.header_height;
        let tick_height =
            (this.options.bar_height + this.options.padding) *
            this.tasks.length;

        for (let date of this.dates) {
            let tick_class = 'tick';
            // thick tick for monday
            if (this.view_is(VIEW_MODE.DAY) && date.getDate() === 1) {
                tick_class += ' thick';
            }
            // thick tick for first week
            if (
                this.view_is(VIEW_MODE.WEEK) &&
                date.getDate() >= 1 &&
                date.getDate() < 8
            ) {
                tick_class += ' thick';
            }
            // thick ticks for quarters
            if (
                this.view_is(VIEW_MODE.MONTH) &&
                (date.getMonth() + 1) % 3 === 0
            ) {
                tick_class += ' thick';
            }

            // show weekends
            if (date.getDay() === 0 || date.getDay() === 6) {
                createSVG('rect', {
                    width: this.options.column_width,
                    height: tick_height,
                    fill: 'rgba(0,0,0,0.01)',
                    class: 'weekend',
                    x: tick_x,
                    y: tick_y,
                    append_to: this.layers.grid,
                });

                createSVG('rect', {
                    width: this.options.column_width,
                    height: tick_height,
                    fill: 'rgba(0,0,0,0.01)',
                    class: 'weekend',
                    x: tick_x,
                    y: tick_y,
                    append_to: this.header_layers.grid,
                });
            }

            createSVG('path', {
                d: `M ${tick_x} ${tick_y} v ${tick_height}`,
                class: tick_class,
                append_to: this.layers.grid,
            });

            if (this.view_is(VIEW_MODE.MONTH)) {
                tick_x +=
                    (date_utils.get_days_in_month(date) *
                        this.options.column_width) /
                    30;
            } else {
                tick_x += this.options.column_width;
            }
        }
    }

    make_grid_highlights() {
        // highlight today's date
        let x, y, width, height;
        if (this.view_is(VIEW_MODE.DAY)) {
             x =
                (date_utils.diff(date_utils.today(), this.gantt_start, 'hour') /
                    this.options.step) *
                this.options.column_width - 8;
            y = 0;

            width = this.options.column_width;
            height =
                (this.options.bar_height + this.options.padding) *
                this.tasks.length +
                this.options.header_height +
                this.options.padding / 2;

            createSVG('rect', {
                x,
                y,
                width,
                height,
                class: 'today-highlight',
                append_to: this.layers.grid,
            });

            createSVG('rect', {
                x,
                y,
                width,
                height: 60,
                class: 'today-highlight',
                append_to: this.header_layers.grid,
            });
        } else if (this.view_is(VIEW_MODE.QUARTER_DAY)) {
            x =
                (date_utils.diff(date_utils.today(), this.gantt_start, 'hour') /
                    this.options.step) *
                this.options.column_width + new Date().getHours() * this.options.column_width;
            y = 0;

            width = this.options.column_width;
            height =
                (this.options.bar_height + this.options.padding) *
                this.tasks.length +
                this.options.header_height +
                this.options.padding / 2;
        } else if (this.view_is(VIEW_MODE.MONTH)) {
            x =
                (date_utils.diff(date_utils.today(), this.gantt_start, 'month') /
                    this.options.step) *
                this.options.column_width + new Date().getMonth() * this.options.column_width + 4
            y = 0;
            width = this.options.column_width;
            height =
                (this.options.bar_height + this.options.padding) *
                this.tasks.length +
                this.options.header_height +
                this.options.padding / 2;
        }

        createSVG('rect', {
            x,
            y,
            width,
            height,
            class: 'today-highlight',
            append_to: this.layers.grid,
        });

        createSVG('rect', {
            x,
            y,
            width,
            height: 60,
            class: 'today-highlight',
            append_to: this.header_layers.grid,
        });
    }

    make_dates() {
        // for (let date of this.get_dates_to_draw()) {
        //     createSVG('text', {
        //         x: date.lower_x,
        //         y: date.lower_y,
        //         innerHTML: date.lower_text,
        //         class: 'lower-text',
        //         append_to: this.layers.date,
        //     });
        //
        //     if (date.upper_text) {
        //         const $upper_text = createSVG('text', {
        //             x: date.upper_x,
        //             y: date.upper_y,
        //             innerHTML: date.upper_text,
        //             class: 'upper-text',
        //             append_to: this.layers.date,
        //         });
        //
        //         // remove out-of-bound dates
        //         if (
        //             $upper_text.getBBox().x2 > this.layers.grid.getBBox().width
        //         ) {
        //             $upper_text.remove();
        //         }
        //     }
        // }

        for (let date of this.get_dates_to_draw()) {
            createSVG('text', {
                x: date.lower_x,
                y: date.lower_y,
                innerHTML: date.lower_text,
                class: 'lower-text',
                append_to: this.header_layers.date,
            });

            if (date.upper_text) {
                const $upper_text = createSVG('text', {
                    x: date.upper_x,
                    y: date.upper_y,
                    innerHTML: date.upper_text,
                    class: 'upper-text',
                    append_to: this.header_layers.date,
                });

                // remove out-of-bound dates
                $upper_text.getBBox().x2 > this.header_layers.grid.getBBox().width
                if (
                    $upper_text.getBBox().x2 > this.header_layers.grid.getBBox().width
                ) {
                    $upper_text.remove();
                }
            }
        }
    }

    get_dates_to_draw() {
        let last_date = null;
        const dates = this.dates.map((date, i) => {
            const d = this.get_date_info(date, last_date, i);
            last_date = date;
            return d;
        });
        return dates;
    }

    get_date_info(date, last_date, i) {
        if (!last_date) {
            last_date = date_utils.add(date, 1, 'year');
        }

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const date_text = {
            'Quarter Day_lower': date_utils.format(
                date,
                'HH:mm',
                this.options.language
            ),
            'Half Day_lower': date_utils.format(
                date,
                'HH',
                this.options.language
            ),
            Day_lower:
                date.getDate() !== last_date.getDate()
                    ? date_utils.format(date, `D ${dayNames[date.getDay()].toUpperCase()}`, this.options.language)
                    : '',
            Week_lower:
                date.getMonth() !== last_date.getMonth()
                    ? date_utils.format(date, 'D MMM', this.options.language)
                    : date_utils.format(date, 'D', this.options.language),
            Month_lower: date_utils.format(date, 'MMMM', this.options.language),
            Year_lower: date_utils.format(date, 'YYYY', this.options.language),
            'Quarter Day_upper':
                date.getDate() !== last_date.getDate()
                    ? date_utils.format(date, 'D MMM', this.options.language)
                    : '',
            'Half Day_upper':
                date.getDate() !== last_date.getDate()
                    ? date.getMonth() !== last_date.getMonth()
                        ? date_utils.format(
                            date,
                            'D MMM',
                            this.options.language
                        )
                        : date_utils.format(date, 'D', this.options.language)
                    : '',
            Day_upper:
                date.getDate() === 1
                    ? date_utils.format(date, 'MMMM', this.options.language)
                    : '',
            Week_upper:
                date.getMonth() !== last_date.getMonth()
                    ? date_utils.format(date, 'MMMM', this.options.language)
                    : '',
            Month_upper:
                date.getFullYear() !== last_date.getFullYear()
                    ? date_utils.format(date, 'YYYY', this.options.language)
                    : '',
            Year_upper:
                date.getFullYear() !== last_date.getFullYear()
                    ? date_utils.format(date, 'YYYY', this.options.language)
                    : '',
        };

        const base_pos = {
            x: i * this.options.column_width,
            lower_y: 50,
            upper_y: 50 - 25,
        };

        const x_pos = {
            'Quarter Day_lower': (this.options.column_width * 4) / 2,
            'Quarter Day_upper': (this.options.column_width * 4) / 2,
            'Half Day_lower': (this.options.column_width * 2) / 2,
            'Half Day_upper': 0,
            Day_lower: this.options.column_width / 2,
            Day_upper: (this.options.column_width * 30) / 2,
            Week_lower: 0,
            Week_upper: (this.options.column_width * 4) / 2,
            Month_lower: this.options.column_width / 2,
            Month_upper: (this.options.column_width * 12) / 2,
            Year_lower: this.options.column_width / 2,
            Year_upper: (this.options.column_width * 30) / 2,
        };

        return {
            upper_text: date_text[`${this.options.view_mode}_upper`],
            lower_text: date_text[`${this.options.view_mode}_lower`],
            upper_x: base_pos.x + x_pos[`${this.options.view_mode}_upper`],
            upper_y: base_pos.upper_y,
            lower_x: base_pos.x + x_pos[`${this.options.view_mode}_lower`],
            lower_y: base_pos.lower_y,
        };
    }

    make_bars() {
        this.bars = this.tasks.map((task) => {
            const bar: any = new Bar(this, task);
            this.layers.bar.appendChild(bar.group);
            return bar;
        });
    }

    make_arrows() {
        this.arrows = [];
        for (let task of this.tasks) {
            let arrows = [];
            arrows = task.dependencies
                .map((task_id) => {
                    const dependency = this.get_task(task_id);
                    if (!dependency) return;
                    const arrow: any = new Arrow(
                        this,
                        this.bars[dependency._index], // from_task
                        this.bars[task._index] // to_task
                    );
                    this.layers.arrow.appendChild(arrow.element);
                    return arrow;
                })
                .filter(Boolean); // filter falsy values
            this.arrows = this.arrows.concat(arrows);
        }
    }

    map_arrows_on_bars() {
        for (let bar of this.bars) {
            bar.arrows = this.arrows.filter((arrow) => {
                return (
                    arrow.from_task.task.id === bar.task.id ||
                    arrow.to_task.task.id === bar.task.id
                );
            });
        }
    }

    set_width() {
        const cur_width = this.$svg.getBoundingClientRect().width;
        const row = this.$svg.querySelector('.grid .grid-row')
        const actual_width = row ? row.getAttribute('width') : 0
        if (cur_width < actual_width) {
            this.$svg.setAttribute('width', actual_width);
            this.$header.setAttribute('width', actual_width);
        }

    }

    set_scroll_position() {
        const parent_element = this.$svg.parentElement;
        const header_parent_element = this.$header.parentElement;
        if (!parent_element || !header_parent_element) return;

        const nowDate = new Date()
        const currDateTask = this.bars.find((bar: any) => {
            const task = bar.task as Task
            return new Date(task.start).getDate() === nowDate.getDate() &&
                new Date(task.start).getMonth() === nowDate.getMonth() &&
                new Date(task.start).getFullYear() === nowDate.getFullYear()
        })

        if (currDateTask) {
            parent_element.scrollTop = currDateTask.y - (this.options.padding / 2)
        }

        const target_date = this.options.scrollTo
            ? this.options.scrollTo
            : this.get_oldest_starting_date()


        const hours_before_first_task = date_utils.diff(
            target_date,
            this.gantt_start,
            'hour'
        );

        let scroll_pos =
            (hours_before_first_task / this.options.step) *
            this.options.column_width - 30

        if (this.view_is(VIEW_MODE.QUARTER_DAY)) {
            const currHour = new Date().getHours()
            scroll_pos += currHour * this.options.column_width
        }

        parent_element.scrollLeft = scroll_pos;
        header_parent_element.scrollLeft = scroll_pos;
    }

    bind_grid_click() {
        $.on(
            this.$svg,
            this.options.popup_trigger,
            '.grid-row, .grid-header',
            () => {
                this.unselect_all();
                this.hide_popup();
            }
        );
    }

    bind_bar_events() {
        return
        let is_dragging = false;
        let x_on_start = 0;
        let y_on_start = 0;
        let is_resizing_left = false;
        let is_resizing_right = false;
        let parent_bar_id = null;
        let bars = []; // instanceof Bar
        this.bar_being_dragged = null;

        function action_in_progress() {
            return is_dragging || is_resizing_left || is_resizing_right;
        }

        $.on(this.$svg, 'mousedown', '.bar-wrapper, .handle', (e, element) => {
            const bar_wrapper = $.closest('.bar-wrapper', element);

            if (element.classList.contains('left')) {
                is_resizing_left = true;
            } else if (element.classList.contains('right')) {
                is_resizing_right = true;
            } else if (element.classList.contains('bar-wrapper')) {
                is_dragging = true;
            }

            bar_wrapper.classList.add('active');

            x_on_start = e.offsetX;
            y_on_start = e.offsetY;

            parent_bar_id = bar_wrapper.getAttribute('data-id');
            const ids = [
                parent_bar_id,
                ...this.get_all_dependent_tasks(parent_bar_id),
            ];
            bars = ids.map((id) => this.get_bar(id));

            this.bar_being_dragged = parent_bar_id;

            bars.forEach((bar) => {
                const $bar = bar.$bar;
                $bar.ox = $bar.getX();
                $bar.oy = $bar.getY();
                $bar.owidth = $bar.getWidth();
                $bar.finaldx = 0;
            });
        });

        $.on(this.$svg, 'mousemove', (e) => {
            if (!action_in_progress()) return;
            const dx = e.offsetX - x_on_start;
            const dy = e.offsetY - y_on_start;

            bars.forEach((bar) => {
                const $bar = bar.$bar;
                $bar.finaldx = this.get_snap_position(dx);
                this.hide_popup();
                if (is_resizing_left) {
                    if (parent_bar_id === bar.task.id) {
                        bar.update_bar_position({
                            x: $bar.ox + $bar.finaldx,
                            width: $bar.owidth - $bar.finaldx,
                        });
                    } else {
                        bar.update_bar_position({
                            x: $bar.ox + $bar.finaldx,
                        });
                    }
                } else if (is_resizing_right) {
                    if (parent_bar_id === bar.task.id) {
                        bar.update_bar_position({
                            width: $bar.owidth + $bar.finaldx,
                        });
                    }
                } else if (is_dragging) {
                    bar.update_bar_position({x: $bar.ox + $bar.finaldx});
                }
            });
        });

        document.addEventListener('mouseup', (e) => {
            if (is_dragging || is_resizing_left || is_resizing_right) {
                bars.forEach((bar) => bar.group.classList.remove('active'));
            }

            is_dragging = false;
            is_resizing_left = false;
            is_resizing_right = false;
        });

        $.on(this.$svg, 'mouseup', (e) => {
            this.bar_being_dragged = null;
            bars.forEach((bar) => {
                const $bar = bar.$bar;
                if (!$bar.finaldx) return;
                bar.date_changed();
                bar.set_action_completed();
            });
        });

        this.bind_bar_progress();
    }

    bind_bar_progress() {
        let x_on_start = 0;
        let y_on_start = 0;
        let is_resizing = null;
        let bar = null;
        let $bar_progress = null;
        let $bar = null;

        $.on(this.$svg, 'mousedown', '.handle.progress', (e, handle) => {
            is_resizing = true;
            x_on_start = e.offsetX;
            y_on_start = e.offsetY;

            const $bar_wrapper = $.closest('.bar-wrapper', handle);
            const id = $bar_wrapper.getAttribute('data-id');
            bar = this.get_bar(id);

            $bar_progress = bar.$bar_progress;
            $bar = bar.$bar;

            $bar_progress.finaldx = 0;
            $bar_progress.owidth = $bar_progress.getWidth();
            $bar_progress.min_dx = -$bar_progress.getWidth();
            $bar_progress.max_dx = $bar.getWidth() - $bar_progress.getWidth();
        });

        $.on(this.$svg, 'mousemove', (e) => {
            if (!is_resizing) return;
            let dx = e.offsetX - x_on_start;
            let dy = e.offsetY - y_on_start;

            if (dx > $bar_progress.max_dx) {
                dx = $bar_progress.max_dx;
            }
            if (dx < $bar_progress.min_dx) {
                dx = $bar_progress.min_dx;
            }

            const $handle = bar.$handle_progress;
            $.attr($bar_progress, 'width', $bar_progress.owidth + dx);
            $.attr($handle, 'points', bar.get_progress_polygon_points());
            $bar_progress.finaldx = dx;
        });

        $.on(this.$svg, 'mouseup', () => {
            is_resizing = false;
            if (!($bar_progress && $bar_progress.finaldx)) return;
            bar.progress_changed();
            bar.set_action_completed();
        });
    }

    bind_scroll() {
        $.on(this.$container, 'scroll', (e) => {
            const scrollX = this.$container.scrollLeft;
            this.$header_container.scrollLeft = Math.floor(scrollX);
        });
    }

    get_all_dependent_tasks(task_id) {
        let out = [];
        let to_process = [task_id];
        while (to_process.length) {
            const deps = to_process.reduce((acc, curr) => {
                acc = acc.concat(this.dependency_map[curr]);
                return acc;
            }, []);

            out = out.concat(deps);
            to_process = deps.filter((d) => !to_process.includes(d));
        }

        return out.filter(Boolean);
    }

    get_snap_position(dx) {
        let odx = dx,
            rem,
            position;

        if (this.view_is(VIEW_MODE.WEEK)) {
            rem = dx % (this.options.column_width / 7);
            position =
                odx -
                rem +
                (rem < this.options.column_width / 14
                    ? 0
                    : this.options.column_width / 7);
        } else if (this.view_is(VIEW_MODE.MONTH)) {
            rem = dx % (this.options.column_width / 30);
            position =
                odx -
                rem +
                (rem < this.options.column_width / 60
                    ? 0
                    : this.options.column_width / 30);
        } else {
            rem = dx % this.options.column_width;
            position =
                odx -
                rem +
                (rem < this.options.column_width / 2
                    ? 0
                    : this.options.column_width);
        }
        return position;
    }

    unselect_all() {
        [...this.$svg.querySelectorAll('.bar-wrapper')].forEach((el) => {
            el.classList.remove('active');
        });
    }

    view_is(modes) {
        if (typeof modes === 'string') {
            return this.options.view_mode === modes;
        }

        if (Array.isArray(modes)) {
            return modes.some((mode) => this.options.view_mode === mode);
        }

        return false;
    }

    get_task(id) {
        return this.tasks.find((task) => {
            return task.id === id;
        });
    }

    get_bar(id) {
        return this.bars.find((bar) => {
            return bar.task.id === id;
        });
    }

    show_popup(options) {
        if (!this.popup) {
            this.popup = new Popup(
                this.popup_wrapper,
                this.options.custom_popup_html
            ) as any;
        }

        if (this.popup.parent.getBoundingClientRect() > window.innerWidth - 400) {
            this.popup_wrapper.style.transform = 'translateX(-100%)'
        } else {
            this.popup_wrapper.style.transform = undefined
        }

        this.popup.show(options);

    }

    hide_popup() {
        this.popup && this.popup.hide();
    }

    trigger_event(event, args) {
        if (this.options['on_' + event]) {
            this.options['on_' + event].apply(null, args);
        }
    }

    /**
     * Gets the oldest starting date from the list of tasks
     *
     * @returns Date
     * @memberof Gantt
     */
    get_oldest_starting_date() {
        if (!this.tasks.length) {
            const date = new Date()
            date.setHours(0,0,0)
            if (!this.view_is(VIEW_MODE.QUARTER_DAY)) {
                date.setDate(date.getDate() - 2)
            }
            console.log('!task')
            return date
        }


        return this.tasks
            .map((task) => task._start)
            .reduce((prev_date, cur_date) =>
                cur_date <= prev_date ? cur_date : prev_date
            );
    }

    /**
     * Clear all elements from the parent svg element
     *
     * @memberof Gantt
     */
    clear() {
        this.$svg.innerHTML = '';
        this.$header.innerHTML = '';
    }
}

Gantt.VIEW_MODE = VIEW_MODE;

function generate_id(task) {
    return task.name + '_' + Math.random().toString(36).slice(2, 12);
}
