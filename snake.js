$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();

    // Initiatize the random playground by creating playground table
    // Positions snakes and ladders in random order.
    setup_playground();

    $('#dice_face').click(function() {
        startroll();
        //roll_dice();
    });
});

// Define constants
var player = 1; // Current player variable
var player_pos = 0; // Show the current player position in the board
var click_count = 1; // Variable to calculate how many dice roll it took to win
var total_players = 1; // Variable to define total players in the game
var game_start = 0; // Indicator to show the game has started - turns active on first dice roll
var started = 0; // Indicator to show the game has started - turns active on when dice value turns 1 for first time
var start = 0; // Start of a dice position on a movement
var end = 0; // End of a dice position on a movement => start + dice value
var total_ladders = 5; // Max ladders count in the game. Min = 1 by default
var total_snakes = 5; // Max snakes count in the game. Min = 1 by default
var ladder_steps = [50, 35, 28, 19, 11]; // Array to choose the length of ladder from
var snake_steps = [40, 30, 23, 14, 6]; // Array to choose the length of snakes from
var new_cell_id = 0;
var player_default_color = "#D50000";

var computer_pos = 0; // Show the current player position in the board
var c_started = 0; // Indicator to show the game has started - turns active on when dice value turns 1 for first time
var c_start = 0; // Start of a dice position on a movement
var c_end = 0; // End of a dice position on a movement => start + dice value
var computer_color = "#8E44AD";
var donot_roll_computer = 0;

// Draw the playground table
// Table are created from 100 to 1 in reverse order which will be managed below
function setup_playground() {
    var cellcount = 100;
    var cell_inner = "<div><span>P1</span><span>P2</span><span>P3</span><span>P4</span></div>";
    for (var i = 1; i <= 10; i++) {
        var cell = "";
        // Reverse the numbering to ensure the flow continues
        // Regular flow continues from 100 to 91 and the next row starts from 90 to 81
        // This numbering has to changed to 81 to 90 so that the numbers/cell flow will be matching the real play board
        if (i % 2 == 0) {
            cellcount = cellcount - 10;
            for (var j = 0; j < 10; j++) {
                cellcount = cellcount + 1;
                cell = cell + "<td id='" + cellcount + "'><span class='cell_id'>" + cellcount + "</span></td>"; // style='background-color:"+get_light_random_bgcolor()+"'
            }
        } else {
            if (i > 1) cellcount = cellcount - 10;
            for (var j = 0; j < 10; j++) {
                cell = cell + "<td id='" + cellcount + "'><span class='cell_id'>" + cellcount + "</span></td>";
                cellcount = cellcount - 1;
            }
        }
        // Adds each row
        $("#tbl_playground tbody").append("<tr id='tr_" + i + "'>" + cell + "</tr>");
    }
    setup_ladder(); // Initiate function to deploy ladders in board - position of ladders are random in each game
    setup_snakes(); // Initiate function to deploy snakes in board - position of snakes are random in each game
}

// Get a random light color which can be applied as cell background
// Add a style statement in function setup_playground() where cell td is defined
function get_light_random_bgcolor() {
    var letters = 'BCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 3; i++) {
        color += letters[Math.floor(Math.random() * letters.length)];
    }
    return color;
}

// Setup ladders at random position in the table
// Only one ladder start is allowed in a row at the moment
// Since the rows are in reverse order, we start by positioning ladder end first and then find out the start position of ladder
function setup_ladder() {
    var ladder_start = "";
    $("#tbl_playground tbody tr").each(function() { // Loop through each rows of table
        var row_id = $(this).attr("id"); // Get current row ID
        var row_pos = 11 - row_id.split('_')[1]; // Convert the row position in 1-10 range

        if (row_pos < 10) {
            var ladder_pos = (row_pos + Math.floor((Math.random() * 10) + 1)) + ((row_pos - 2) * 10); // Get a random position to start the ladder in current row

            $("#tbl_playground tbody tr#" + row_id + " td").each(function() { // Loop through each cell in the row
                var cell_id = $(this).attr("id"); // Get cell ID

                // Check if the current cell already has a ladder start.
                // If Yes - then skip the cell.
                cell_contain_ladder_start(cell_id);

                if (contains_ladder_start == 0) {
                    // Check if total available ladder is greater than 0, check if cell id and ladder position is same & current cell is not the first cell
                    if (total_ladders > 0 && cell_id == ladder_pos && cell_id > 1) {
                        var ladder_start = ladder_steps[Math.floor(Math.random() * ladder_steps.length)]; //Calculate the ladder start position based on the length array defined
                        var index = ladder_steps.indexOf(ladder_start);
                        ladder_steps.splice(index, 1); // Remove the selected step length from the array

                        ladder_start = cell_id - ladder_start; // Get the ladder start position

                        if (ladder_start > 1) {
                            var up_to = '<img src="ladder.png" style="height:50px; position:relative; overflow:scroll" /><div class="up_to"><i class="fa fa-long-arrow-up" aria-hidden="true"></i>' + cell_id + '</div>';

                            $(this).append("<span class='pointers'>LE" + total_ladders + "</span>"); // Mark ladder end position

                            cell_contain_ladder_start(ladder_start);
                            if (contains_ladder_start == 0)
                                $("#tbl_playground tbody tr td#" + ladder_start).append(up_to + "<span class='pointers'>LS" + total_ladders + "</span>"); // Mark ladder start position
                            else {
                                ladder_start = ladder_start - 1;
                                $("#tbl_playground tbody tr td#" + ladder_start).append(up_to + "<span class='pointers'>LS" + total_ladders + "</span>"); // Mark ladder start position
                            }
                        }

                        total_ladders = total_ladders - 1; // Reduce one ladder count
                    }
                }

            });
        }
    });
}

// Setup ladders at random position in the table
// Logic of marking snakes is same as that of ladder. Refer comments above for more details.
function setup_snakes() {
    $("#tbl_playground tbody tr").each(function() {
        var row_id = $(this).attr("id");
        var row_pos = 11 - row_id.split('_')[1];

        if (row_pos > 1) {
            var snake_pos = (row_pos + Math.floor((Math.random() * 10) + 1)) + ((row_pos - 2) * 10);

            $("#tbl_playground tbody tr#" + row_id + " td").each(function() {
                var cell_id = $(this).attr("id");
                if (cell_id < 100) {
                    cell_contain_ladder(cell_id);

                    if (contains_ladder == 0) {

                        var cell_value = $(this).text();
                        // Checks if the current cell contains any ladder start, if yes - then ignore cell
                        if (total_snakes > 0 && cell_id == snake_pos && !(cell_value.indexOf("L") > -1)) {
                            var snake_start = snake_steps[Math.floor(Math.random() * ladder_steps.length)];
                            var index = snake_steps.indexOf(snake_start);
                            snake_steps.splice(index, 1);

                            snake_start = cell_id - snake_start;
                            if (snake_start > 0) {
                                var random_snake = "snake" + Math.floor((Math.random() * 3) + 1) + ".png";
                                $(this).append("<img src='" + random_snake + "' style='height:50px; position:relative; overflow:scroll' />");

                                var down_to = '<div class="down_to"><i class="fa fa-long-arrow-down" aria-hidden="true"></i>' + snake_start + '</div>';
                                $(this).append(down_to + "<span class='pointers'>SS" + total_snakes + "</span>");
                                $("#tbl_playground tbody tr td#" + snake_start).append("<span class='pointers'>SE" + total_snakes + "</span>");
                            }

                            total_snakes = total_snakes - 1;
                        }

                    }
                }

            });
        }
    });
}

var contains_ladder = 0;

function cell_contain_ladder(cell_id) {
    var cell_value = $("#tbl_playground tbody tr td#" + cell_id).text();
    if (cell_value.indexOf("L") > -1)
        contains_ladder = 1;
    else
        contains_ladder = 0;
}

var contains_ladder_start = 0;

function cell_contain_ladder_start(cell_id) {
    var cell_value = $("#tbl_playground tbody tr td#" + cell_id).text();
    if (cell_value.indexOf("LS") > -1)
        contains_ladder_start = 1;
    else
        contains_ladder_start = 0;
}

var pcdone = 1;

function startroll(){
    if($("#you_marker").css('display') == "block")
      roll_dice();
}

function roll_dice() {

    if (game_start == 0) {
        game_start = 1;
        $("#dice_initial").hide();
    }
    $("#div_info").hide();
    $("#div_player_selection").hide();

    // SINGLE PLALYER
    if (total_players == 1) {
        if (player_pos == 100)
            return false;

        // Get dice value -  random from 1-6
        var dice_val = roll(); //get_dice_val();
        //$("#dice_value").text(dice_val);

        if(dice_val < 6){
          $("#you_marker").hide();
          $("#pc_marker").show();
        }

        // Mark first entry to playground
        if (dice_val == 1 && player_pos == 0) {
            initiate_game();
            mark_player_current_position(player_pos, player_default_color);

            $("#cur_dice_pos").text(player_pos);
            $("#prev_dice_pos").text("0");

            roll_computer();

            return false;
        }

        // Actions for all entries in playground - except first entry
        if (started == 1) {
            start = player_pos;
            end = parseInt(player_pos) + parseInt(dice_val);

            if (end <= 100) {
                $("#prev_dice_pos").text(end);
                clear_player_prev_position(start);

                // Get cell value to check for any snakes or ladders
                var cell_value = $("#tbl_playground tbody tr td#" + end).text();

                var has_ladder = 0;
                var has_snake = 0;

                // Check for ladder in the end position
                if (cell_value.indexOf("LS") > -1) {
                    var cell_ladder = cell_value.substr(cell_value.indexOf("LS") + 2);
                    get_new_cell_id("LE" + cell_ladder);

                    $("#prev_dice_pos").text(end);

                    $("#tbl_playground tbody tr td#" + end).addClass('animated zoomIn');
                    end = new_cell_id;
                } else if (cell_value.indexOf("SS") > -1) {
                    var cell_ladder = cell_value.substr(cell_value.indexOf("SS") + 2);
                    get_new_cell_id("SE" + cell_ladder);

                    $("#prev_dice_pos").text(end);

                    $("#tbl_playground tbody tr td#" + end).addClass('animated zoomIn');
                    end = new_cell_id;
                }

                player_pos = end;
                click_count = click_count + 1;

                if (end > 100) {
                    player_pos = start;
                    $("#prev_dice_pos").text(player_pos);
                } else if (end == 100) {
                    donot_roll_computer = 1;
                    $("#prev_dice_pos").text(start);
                    $("#winner").text("YOU WIN");
                    $("#modal_win").modal("show");
                    $("#play_area").fireworks();
                }

                $("#tbl_playground tbody tr td#" + end).focus();
                mark_player_current_position(player_pos, player_default_color);
                $("#cur_dice_pos").text(player_pos);

            }
        }

        if(dice_val <6)
          roll_computer();
    }
}

function roll_computer() {
    setTimeout(
        function() {
            if (donot_roll_computer == 0) {

                // Get dice value -  random from 1-6
                var dice_val = roll(); //get_dice_val();
                //$("#dice_c_value").text(dice_val);

                if(dice_val<6){
                  $("#you_marker").show();
                  $("#pc_marker").hide();
                }

                // Mark first entry to playground
                if (dice_val == 1 && computer_pos == 0) {
                    initiate_c_game();
                    mark_player_current_position(computer_pos, computer_color);
                    $("#cur_c_dice_pos").text(computer_pos);
                    $("#prev_c_dice_pos").text("0");
                    return false;
                }

                // Actions for all entries in playground - except first entry
                if (c_started == 1) {
                    c_start = computer_pos;
                    c_end = parseInt(computer_pos) + parseInt(dice_val);

                    if (c_end <= 100) {
                        $("#prev_c_dice_pos").text(c_end);
                        clear_player_prev_position(c_start);

                        // Get cell value to check for any snakes or ladders
                        var cell_value = $("#tbl_playground tbody tr td#" + c_end).text();

                        var has_ladder = 0;
                        var has_snake = 0;

                        // Check for ladder in the end position
                        if (cell_value.indexOf("LS") > -1) {
                            var cell_ladder = cell_value.substr(cell_value.indexOf("LS") + 2);
                            get_new_cell_id("LE" + cell_ladder);

                            $("#prev_c_dice_pos").text(c_end);

                            $("#tbl_playground tbody tr td#" + c_end).addClass('animated zoomIn');
                            c_end = new_cell_id;
                        } else if (cell_value.indexOf("SS") > -1) {
                            var cell_ladder = cell_value.substr(cell_value.indexOf("SS") + 2);
                            get_new_cell_id("SE" + cell_ladder);

                            $("#prev_c_dice_pos").text(c_end);

                            $("#tbl_playground tbody tr td#" + c_end).addClass('animated zoomIn');
                            c_end = new_cell_id;
                        }

                        computer_pos = c_end;

                        if (c_end > 100) {
                            computer_pos = c_start;
                            $("#prev_c_dice_pos").text(computer_pos);
                        } else if (c_end == 100) {
                            $("#prev_c_dice_pos").text(c_start);
                            $("#winner").text("COMPUTER WON");
                            $("#modal_win").modal("show");
                            $("#play_area").fireworks();
                        }

                        $("#tbl_playground tbody tr td#" + c_end).focus();
                        mark_player_current_position(computer_pos, computer_color);
                        $("#cur_c_dice_pos").text(computer_pos);
                    }
                }
            }
            if(dice_val==6)
              roll_computer();
        }, 1000);
}

function roll() {
  var arr_values = ["one","two","three","four","five","six"];
  var dice_value = Math.floor((Math.random() * 6) + 1);
  $('#dice_face').removeClass($('#dice_face').attr('class')).addClass(arr_values[dice_value-1]);
  return dice_value;
}

function get_new_cell_id(str) {
    $("#tbl_playground tbody tr td").each(function() {
        var cell_id = $(this).attr("id");
        var cell_value = $("#tbl_playground tbody tr td#" + cell_id).text();
        if (cell_value.indexOf(str) > -1) {
            new_cell_id = cell_id;
            return false;
        } else {
            new_cell_id = 0;
        }
    });
}

function initiate_game() {
    player_pos = 1;
    started = 1;
    start = 1;
    end = 1;
}

function initiate_c_game() {
    computer_pos = 1;
    c_started = 1;
    c_start = 1;
    c_end = 1;
}

function mark_player_current_position(id, color) {
    $("#" + id).css({
        "background-color": color,
        "color": color
    });
}

function clear_player_prev_position(id) {
    $("#" + id).css({
        "background-color": "white",
        "color": "#D6EAF8"
    });
}

function restart_game() {
    location.reload();
}

// START OF FIREWORKS
// CODE BORROWED FROM JQUERY.FIREWORKS :-)
(function($) {
    var MAX_ROCKETS = 5,
        MAX_PARTICLES = 500;

    var FUNCTIONS = {
        'init': function(element) {
            var jqe = $(element);

            // Check this element isn't already inited
            if (jqe.data('fireworks_data') !== undefined) {
                console.log('Looks like this element is already inited!');
                return;
            }

            // Setup fireworks on this element
            var canvas = document.createElement('canvas'),
                canvas_buffer = document.createElement('canvas'),
                data = {
                    'element': element,
                    'canvas': canvas,
                    'context': canvas.getContext('2d'),
                    'canvas_buffer': canvas_buffer,
                    'context_buffer': canvas_buffer.getContext('2d'),
                    'particles': [],
                    'rockets': []
                };

            // Add & position the canvas
            if (jqe.css('position') === 'static') {
                element.style.position = 'relative';
            }
            element.appendChild(canvas);
            canvas.style.position = 'absolute';
            canvas.style.top = '0px';
            canvas.style.bottom = '0px';
            canvas.style.left = '0px';
            canvas.style.right = '0px';

            // Kickoff the loops
            data.interval = setInterval(loop.bind(this, data), 1000 / 50);

            // Save the data for later
            jqe.data('fireworks_data', data);
        },
        'destroy': function(element) {
            var jqe = $(element);

            // Check this element isn't already inited
            if (jqe.data('fireworks_data') === undefined) {
                console.log('Looks like this element is not yet inited!');
                return;
            }
            var data = jqe.data('fireworks_data');
            jqe.removeData('fireworks_data');

            // Stop the interval
            clearInterval(data.interval);

            // Remove the canvas
            data.canvas.remove();

            // Reset the elements positioning
            data.element.style.position = '';
        }
    };

    $.fn.fireworks = function(action) {
        // Assume no action means we want to init
        if (!action) {
            action = 'init';
        }

        // Process each element
        this.each(function() {
            FUNCTIONS[action](this);
        });

        // Chaining ftw :)
        return this;
    };

    function launch(data) {
        if (data.rockets.length < MAX_ROCKETS) {
            var rocket = new Rocket(data);
            data.rockets.push(rocket);
        }
    }

    function loop(data) {
        // Launch a new rocket
        launch(data);

        // Update screen size
        if (data.canvas_width != data.element.offsetWidth) {
            data.canvas_width = data.canvas.width = data.canvas_buffer.width = data.element.offsetWidth;
        }
        if (data.canvas_height != data.element.offsetHeight) {
            data.canvas_height = data.canvas.height = data.canvas_buffer.height = data.element.offsetHeight;
        }

        // Fade the background out slowly
        data.context_buffer.clearRect(0, 0, data.canvas.width, data.canvas.height);
        data.context_buffer.globalAlpha = 0.9;
        data.context_buffer.drawImage(data.canvas, 0, 0);
        data.context.clearRect(0, 0, data.canvas.width, data.canvas.height);
        data.context.drawImage(data.canvas_buffer, 0, 0);

        // Update the rockets
        var existingRockets = [];
        data.rockets.forEach(function(rocket) {
            // update and render
            rocket.update();
            rocket.render(data.context);

            // random chance of 1% if rockets is above the middle
            var randomChance = rocket.pos.y < (data.canvas.height * 2 / 3) ? (Math.random() * 100 <= 1) : false;

            /* Explosion rules
                 - 80% of screen
                - going down
                - close to the mouse
                - 1% chance of random explosion
            */
            if (rocket.pos.y < data.canvas.height / 5 || rocket.vel.y >= 0 || randomChance) {
                rocket.explode(data);
            } else {
                existingRockets.push(rocket);
            }
        });
        data.rockets = existingRockets;

        // Update the particles
        var existingParticles = [];
        data.particles.forEach(function(particle) {
            particle.update();

            // render and save particles that can be rendered
            if (particle.exists()) {
                particle.render(data.context);
                existingParticles.push(particle);
            }
        });
        data.particles = existingParticles;

        while (data.particles.length > MAX_PARTICLES) {
            data.particles.shift();
        }
    }

    function Particle(pos) {
        this.pos = {
            x: pos ? pos.x : 0,
            y: pos ? pos.y : 0
        };
        this.vel = {
            x: 0,
            y: 0
        };
        this.shrink = .97;
        this.size = 2;

        this.resistance = 1;
        this.gravity = 0;

        this.flick = false;

        this.alpha = 1;
        this.fade = 0;
        this.color = 0;
    }

    Particle.prototype.update = function() {
        // apply resistance
        this.vel.x *= this.resistance;
        this.vel.y *= this.resistance;

        // gravity down
        this.vel.y += this.gravity;

        // update position based on speed
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;

        // shrink
        this.size *= this.shrink;

        // fade out
        this.alpha -= this.fade;
    };

    Particle.prototype.render = function(c) {
        if (!this.exists()) {
            return;
        }

        c.save();

        c.globalCompositeOperation = 'lighter';

        var x = this.pos.x,
            y = this.pos.y,
            r = this.size / 2;

        var gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
        gradient.addColorStop(0.1, "rgba(255,255,255," + this.alpha + ")");
        gradient.addColorStop(0.8, "hsla(" + this.color + ", 100%, 50%, " + this.alpha + ")");
        gradient.addColorStop(1, "hsla(" + this.color + ", 100%, 50%, 0.1)");

        c.fillStyle = gradient;

        c.beginPath();
        c.arc(this.pos.x, this.pos.y, this.flick ? Math.random() * this.size : this.size, 0, Math.PI * 2, true);
        c.closePath();
        c.fill();

        c.restore();
    };

    Particle.prototype.exists = function() {
        return this.alpha >= 0.1 && this.size >= 1;
    };

    function Rocket(data) {
        Particle.apply(
            this, [{
                x: Math.random() * data.canvas.width * 2 / 3 + data.canvas.width / 6,
                y: data.canvas.height
            }]
        );

        this.explosionColor = Math.floor(Math.random() * 360 / 10) * 10;
        this.vel.y = Math.random() * -3 - 4;
        this.vel.x = Math.random() * 6 - 3;
        this.size = 2;
        this.shrink = 0.999;
        this.gravity = 0.01;
    }

    Rocket.prototype = new Particle();
    Rocket.prototype.constructor = Rocket;

    Rocket.prototype.explode = function(data) {
        var count = Math.random() * 10 + 80;

        for (var i = 0; i < count; i++) {
            var particle = new Particle(this.pos);
            var angle = Math.random() * Math.PI * 2;

            // emulate 3D effect by using cosine and put more particles in the middle
            var speed = Math.cos(Math.random() * Math.PI / 2) * 15;

            particle.vel.x = Math.cos(angle) * speed;
            particle.vel.y = Math.sin(angle) * speed;

            particle.size = 10;

            particle.gravity = 0.2;
            particle.resistance = 0.92;
            particle.shrink = Math.random() * 0.05 + 0.93;

            particle.flick = true;
            particle.color = this.explosionColor;

            data.particles.push(particle);
        }
    };

    Rocket.prototype.render = function(c) {
        if (!this.exists()) {
            return;
        }

        c.save();

        c.globalCompositeOperation = 'lighter';

        var x = this.pos.x,
            y = this.pos.y,
            r = this.size / 2;

        var gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
        gradient.addColorStop(0.1, "rgba(255, 255, 255 ," + this.alpha + ")");
        gradient.addColorStop(0.2, "rgba(255, 180, 0, " + this.alpha + ")");

        c.fillStyle = gradient;

        c.beginPath();
        c.arc(this.pos.x, this.pos.y, this.flick ? Math.random() * this.size / 2 + this.size / 2 : this.size, 0, Math.PI * 2, true);
        c.closePath();
        c.fill();

        c.restore();
    };
}(jQuery));
// END OF FIREWORKS
