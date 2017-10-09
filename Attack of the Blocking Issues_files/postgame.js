
$(document).ready(function () {
  $(".gift.enabled:not( > .chosen)").live("click", function () {
    PreSelect($(this), $("img", this).attr("data-id"));
  })

  $("#replay").live("click", function (evt) {
    replay(evt);
  })

  $(".noSelect").live("click", function (evt) {
    evt.preventDefault();
    setTimeout(RemovePreSelect, 100);
  })

  $(".yesSelect").live("click", function (evt) {
    evt.preventDefault();
    var el = $(this).closest(".gift.enabled");

    ChooseGift(el, $("img", el).attr("data-id"));
  })

});

var giftChosen = false;

function RemovePreSelect() {
  $(".preselectSection").remove();
}

function PreSelect($el, id) {
  RemovePreSelect();

  $(".preselectSection").remove();
  if ($(".chosen", $el).length == 0 && !giftChosen) {
    var title = $("img", $el).attr("title");
    $el.append("<div class='preselectSection'><div class='preselect'></div><p class='text'>Choose the " + title + "?<a href='#' class='yesSelect'>yes, I do!</a><a href='#' class='noSelect'>no, I'll continue.</a></p></div>");
  }
}

function ChooseGift($el, id) {
  RemovePreSelect();

  if ($(".chosen", $el).length == 0 && !giftChosen) {
    // show text
    $el.append("<div class='chosen'></div><p class='text'>Great! We'll send you this gift.</p>");
    $el.addClass("hover");
    giftChosen = true;

    //disable rest
    $(".gift").each(function () {
      var tEl = $(this);
      if ($(".chosen", tEl).length == 0) {
        tEl.removeClass("enabled");
        tEl.append("<div class='chosen'></div>");
      }
    });

    //hide "or" and "unlock"
    $("#or").slideUp(500);
    $("#unlock").slideUp(500);

    //post choice
    $.post("/SaveGiftChoise", { clientId: $("img", $el).attr("data-klant"), giftId: id });
  }
}

function postScreen(score, bugsShot) {
  var clientId = $("#clientId").val();
  $.post("/postgame", { clientId: clientId, topScore: score, bugsShot: bugsShot }, function (data) {
    var html = $(data);
    $("#postscreenPopUp").html(html);
    $("#postscreenPopUp").show();
  });
}

function replay(evt) {
  $("#postscreenPopUp").hide();
  ig.momg.startGame();
  loaded = true;
  evt.preventDefault();
}