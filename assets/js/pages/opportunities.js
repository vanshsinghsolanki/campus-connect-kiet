/** Opportunities board: Category Filter → View Opportunity → Apply (demo) */
CC.page("opportunities", function () {
  "use strict";
  var u = CC.utils, ui = CC.ui, C = CC.components, L = CC.listingUI, esc = u.escapeHtml, icon = CC.icon;
  var meta = CC.api.meta();
  var grid = u.$("#results");
  var summary = u.$("#result-summary");
  var CAT_ICON = { internship: "graduation", job: "briefcase", hackathon: "code", certification: "award" };

  grid.innerHTML = ui.skeletonCards(4);
  L.sheet(u.$("#filters-sheet"), u.$("#filter-toggle"));

  CC.api.opportunities.list().then(function (items) {
    var cats = u.$("#category-options");
    cats.insertAdjacentHTML("beforeend",
      '<label class="choice-chip"><input type="radio" name="category" value="" checked><span>All <span class="count">' + items.length + "</span></span></label>" +
      meta.opportunityCategories.map(function (c) {
        var n = items.filter(function (o) { return o.category === c.code; }).length;
        return '<label class="choice-chip"><input type="radio" name="category" value="' + c.code + '"><span>' + icon(CAT_ICON[c.code]) + esc(c.name) + ' <span class="count">' + n + "</span></span></label>";
      }).join(""));

    var listing = CC.listing({
      form: u.$("#opp-filters"),
      items: items,
      defaultSort: "deadline",
      predicate: function (o, s) {
        var days = u.daysUntil(o.deadline);
        if (s.category && o.category !== s.category) return false;
        if (s.mode.length && s.mode.indexOf(o.mode) === -1) return false;
        if (s.status === "open" && days < 0) return false;
        if (s.status === "soon" && (days < 0 || days > 7)) return false;
        if (s.status === "closed" && days >= 0) return false;
        if (s.saved.length && !CC.activity.isSaved("opportunities", o.id)) return false;
        return CC.listing.matches(s.q, [o.title, o.org, o.location, o.description, o.tags.join(" "), o.category]);
      },
      sorters: {
        deadline: function (a, b) {
          var da = u.daysUntil(a.deadline), db = u.daysUntil(b.deadline);
          if ((da < 0) !== (db < 0)) return da < 0 ? 1 : -1; // closed items last
          return a.deadline.localeCompare(b.deadline);
        },
        title: function (a, b) { return a.title.localeCompare(b.title); },
        org: function (a, b) { return a.org.localeCompare(b.org); }
      },
      render: function (list, s) {
        summary.innerHTML = "Showing <strong>" + list.length + "</strong> of " + items.length + " opportunities" + (s.q ? " for “" + esc(s.q) + "”" : "");
        u.$("[data-result-count]").textContent = list.length;
        var n = L.activeChips(u.$("#active-filters"), s, {
          mode: u.capitalize,
          status: function (v) { return { open: "Open", soon: "Closing soon", closed: "Closed" }[v]; },
          saved: function () { return "Saved only"; }
        }, listing);
        u.$("#filter-count").textContent = n || "";
        grid.innerHTML = list.length ? list.map(C.opportunityCard).join("") : ui.empty({
          icon: "briefcase",
          title: "No opportunities found",
          text: "Try another category or clear your filters.",
          action: '<button type="reset" class="btn btn--primary">Clear filters</button>'
        });
      }
    });

    document.addEventListener("cc:saved", function () { if (listing.state().saved.length) listing.refresh(); });
    CC.actions.openFromUrl("opportunities", CC.actions.viewOpportunity);
  });
});
