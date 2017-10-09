var htmlString = {

  jsonData: null,
  isLoaded: false,

  init: function (client) {
    var clientName = $("#clientName").val();
    $.getJSON("/json/" + clientName + ".json", function (data) {
      htmlString.jsonData = data.Lines;
      htmlString.isLoaded = true;
    });
  },

  getTag: function () {
    if (!this.isLoaded)
      return;

    var amount = htmlString.jsonData.length;
    var itemNr = Math.floor(Math.random() * (amount + 1));
    return this.jsonData[itemNr];
  }
}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if (results == null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}


$(document).ready(function () {
  var client = getParameterByName("klant");
  if (!client)
    client = "q42";
  htmlString.init(client);
});
