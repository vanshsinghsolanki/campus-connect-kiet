/** Resource library: Type Filter → View Resource → Download / Open */
CC.page("resources", function () {
  "use strict";
  var u = CC.utils, ui = CC.ui, C = CC.components, L = CC.listingUI, esc = u.escapeHtml, icon = CC.icon;
  var TYPE_ICON = { notes: "file", video: "video", ebook: "book", roadmap: "map", paper: "file", course: "layers" };
  var meta = CC.api.meta();
  var grid = u.$("#results");
  var summary = u.$("#result-summary");

  grid.innerHTML = ui.skeletonCards(4);
  L.sheet(u.$("#filters-sheet"), u.$("#filter-toggle"));

  CC.api.resources.list().then(function (items) {
    u.$("#type-options").insertAdjacentHTML("beforeend",
      '<label class="choice-chip"><input type="radio" name="type" value="" checked><span>All <span class="count">' + items.length + "</span></span></label>" +
      meta.resourceTypes.map(function (t) {
        var n = items.filter(function (r) { return r.type === t.code; }).length;
        return n ? '<label class="choice-chip"><input type="radio" name="type" value="' + t.code + '"><span>' + icon(TYPE_ICON[t.code]) + esc(t.name) + ' <span class="count">' + n + "</span></span></label>" : "";
      }).join(""));

    var depts = meta.departments.filter(function (d) { return items.some(function (r) { return r.department === d.code; }); });
    u.$("#f-department").insertAdjacentHTML("beforeend", L.options(depts));
    var subjects = items.map(function (r) { return r.subject; })
      .filter(function (v, i, a) { return a.indexOf(v) === i; })
      .sort(function (a, b) { return a.localeCompare(b); });
    u.$("#f-subject").insertAdjacentHTML("beforeend", L.options(subjects));

    var listing = CC.listing({
      form: u.$("#res-filters"),
      items: items,
      defaultSort: "popular",
      predicate: function (r, s) {
        if (s.type && r.type !== s.type) return false;
        if (s.department && r.department !== s.department) return false;
        if (s.subject && r.subject !== s.subject) return false;
        if (s.saved.length && !CC.activity.isSaved("resources", r.id)) return false;
        return CC.listing.matches(s.q, [r.title, r.subject, r.description, r.department, u.lookup("resourceTypes", r.type)]);
      },
      sorters: {
        popular: function (a, b) { return b.downloads - a.downloads; },
        title: function (a, b) { return a.title.localeCompare(b.title); }
      },
      render: function (list, s) {
        summary.innerHTML = "Showing <strong>" + list.length + "</strong> of " + items.length + " resources" + (s.q ? " for “" + esc(s.q) + "”" : "");
        u.$("[data-result-count]").textContent = list.length;
        var n = L.activeChips(u.$("#active-filters"), s, {
          department: function (v) { return v; },
          subject: function (v) { return v; },
          saved: function () { return "Saved only"; }
        }, listing);
        u.$("#filter-count").textContent = n || "";
        grid.innerHTML = list.length ? list.map(C.resourceCard).join("") : ui.empty({
          icon: "book",
          title: "No resources found",
          text: "Try a different type or subject.",
          action: '<button type="reset" class="btn btn--primary">Clear filters</button>'
        });
      }
    });

    document.addEventListener("cc:saved", function () { if (listing.state().saved.length) listing.refresh(); });
    CC.actions.openFromUrl("resources", CC.actions.viewResource);
  });
});
