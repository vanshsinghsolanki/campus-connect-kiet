/** Events: Type Filter → View Event → Register (demo) */
CC.page("events", function () {
  "use strict";
  var u = CC.utils, ui = CC.ui, C = CC.components, L = CC.listingUI, esc = u.escapeHtml, icon = CC.icon;
  var TYPE_ICON = { workshop: "code", webinar: "mic", hackathon: "trophy", meetup: "users", seminar: "graduation", fest: "sparkles" };
  var meta = CC.api.meta();
  var grid = u.$("#results");
  var summary = u.$("#result-summary");

  grid.innerHTML = ui.skeletonCards(4);
  L.sheet(u.$("#filters-sheet"), u.$("#filter-toggle"));

  CC.api.events.list().then(function (items) {
    u.$("#type-options").insertAdjacentHTML("beforeend",
      '<label class="choice-chip"><input type="radio" name="type" value="" checked><span>All <span class="count">' + items.length + "</span></span></label>" +
      meta.eventTypes.map(function (t) {
        var n = items.filter(function (e) { return e.type === t.code; }).length;
        return n ? '<label class="choice-chip"><input type="radio" name="type" value="' + t.code + '"><span>' + icon(TYPE_ICON[t.code]) + esc(t.name) + ' <span class="count">' + n + "</span></span></label>" : "";
      }).join(""));

    var listing = CC.listing({
      form: u.$("#event-filters"),
      items: items,
      defaultSort: "date",
      predicate: function (e, s) {
        var days = u.daysUntil(e.date);
        if (s.type && e.type !== s.type) return false;
        if (s.when === "upcoming" && days < 0) return false;
        if (s.when === "past" && days >= 0) return false;
        if (s.mode.length && s.mode.indexOf(e.mode) === -1) return false;
        if (s.mine.indexOf("registered") > -1 && !CC.activity.has("eventRegs", e.id)) return false;
        if (s.mine.indexOf("available") > -1 && C.eventState(e) !== "open") return false;
        return CC.listing.matches(s.q, [e.title, e.organizer, e.venue, e.description, e.tags.join(" "), u.lookup("eventTypes", e.type)]);
      },
      sorters: {
        date: function (a, b) { return a.date.localeCompare(b.date); },
        popular: function (a, b) { return b.registered / b.seats - a.registered / a.seats; }
      },
      render: function (list, s) {
        summary.innerHTML = "Showing <strong>" + list.length + "</strong> " + (s.when === "all" ? "" : s.when + " ") + "events" + (s.q ? " for “" + esc(s.q) + "”" : "");
        u.$("[data-result-count]").textContent = list.length;
        var n = L.activeChips(u.$("#active-filters"), s, {
          mode: function (v) { return { offline: "In person", online: "Online", hybrid: "Hybrid" }[v]; },
          mine: function (v) { return v === "registered" ? "Registered" : "Seats available"; }
        }, listing);
        u.$("#filter-count").textContent = n || "";
        grid.innerHTML = list.length ? list.map(C.eventCard).join("") : ui.empty({
          icon: "calendar",
          title: "No events found",
          text: s.when === "upcoming" ? "No upcoming events match. Try “All” or clear filters." : "Try changing your filters.",
          action: '<button type="reset" class="btn btn--primary">Clear filters</button>'
        });
      }
    });

    CC.actions.openFromUrl("events", CC.actions.viewEvent);
  });
});
