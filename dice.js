$(document).ready(function() {
    $('#dice_face').click(function() {
        roll_dice();
    });
});

function roll_dice(){
  var arr_values = ["one","two","three","four","five","six"];
  var dice_value = Math.floor((Math.random() * 6) + 1);
  $('#dice_face').removeClass($('#dice_face').attr('class')).addClass(arr_values[dice_value-1]);
}
