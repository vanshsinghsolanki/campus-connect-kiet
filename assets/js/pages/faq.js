/** FAQ: live search across questions and answers */
CC.page("faq", function () {
  "use strict";
  var u = CC.utils;
  var input = u.$("#faq-q");
  var items = u.$$(".accordion details");
  var groups = u.$$(".faq-group");
  var empty = u.$("#faq-empty");

  input.addEventListener("input", u.debounce(function () {
    var q = input.value.trim().toLowerCase();
    var shown = 0;
    items.forEach(function (d) {
      var match = !q || d.textContent.toLowerCase().indexOf(q) > -1;
      d.hidden = !match;
      d.open = !!q && match;
      if (match) shown++;
    });
    groups.forEach(function (g) { g.hidden = !u.$$("details", g).some(function (d) { return !d.hidden; }); });
    empty.classList.toggle("hidden", shown > 0);
  }, 150));
});
