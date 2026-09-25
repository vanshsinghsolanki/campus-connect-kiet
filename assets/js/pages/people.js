/** People directory: Browse + Search/Filter Profiles */
CC.page("people", function () {
  "use strict";
  var u = CC.utils, ui = CC.ui, C = CC.components, L = CC.listingUI, esc = u.escapeHtml;
  var meta = CC.api.meta();

  var form = u.$("#people-filters");
  var grid = u.$("#people-grid");
  var summary = u.$("#result-summary");
  grid.innerHTML = ui.skeletonCards(6);

  L.sheet(u.$("#filters-sheet"), u.$("#filter-toggle"));

  CC.api.profiles.list().then(function (profiles) {
    function countBy(key, val) { return profiles.filter(function (p) { return p[key] === val; }).length; }

    // Populate filter controls from data (single source of truth)
    u.$("#role-options").innerHTML = meta.roles.map(function (r) {
      return '<label class="check"><input type="checkbox" name="role" value="' + r.code + '"><span>' + esc(r.name) + "</span><small>" + countBy("role", r.code) + "</small></label>";
    }).join("");
    u.$("#verification-options").innerHTML = meta.verification.map(function (v) {
      return '<label class="check"><input type="checkbox" name="verification" value="' + v.code + '"><span>' + esc(v.name) + "</span><small>" + countBy("verification", v.code) + "</small></label>";
    }).join("");
    u.$("#f-department").insertAdjacentHTML("beforeend", L.options(meta.departments));

    var batches = profiles.map(function (p) { return p.batch; })
      .filter(function (v, i, a) { return a.indexOf(v) === i; })
      .sort(function (a, b) { return b - a; });
    u.$("#f-batch").insertAdjacentHTML("beforeend", L.options(batches));

    var skills = [].concat.apply([], profiles.map(function (p) { return p.skills; }))
      .filter(function (v, i, a) { return a.indexOf(v) === i; })
      .sort(function (a, b) { return a.localeCompare(b); });
    u.$("#f-skill").insertAdjacentHTML("beforeend", L.options(skills));

    var verifiedRank = { verified: 0, pending: 1, unverified: 2 };
    var roleRank = { alumni: 0, senior: 1, student: 2 };

    var listing = CC.listing({
      form: form,
      items: profiles,
      defaultSort: "relevance",
      predicate: function (p, s) {
        if (s.role.length && s.role.indexOf(p.role) === -1) return false;
        if (s.verification.length && s.verification.indexOf(p.verification) === -1) return false;
        if (s.department && p.department !== s.department) return false;
        if (s.batch && String(p.batch) !== String(s.batch)) return false;
        if (s.skill && p.skills.indexOf(s.skill) === -1) return false;
        return CC.listing.matches(s.q, [p.name, p.headline, p.company, p.department, u.lookup("departments", p.department), p.bio, p.skills.join(" "), p.openTo.join(" ")]);
      },
      sorters: {
        relevance: function (a, b) {
          return (verifiedRank[a.verification] - verifiedRank[b.verification]) || (roleRank[a.role] - roleRank[b.role]) || a.name.localeCompare(b.name);
        },
        name: function (a, b) { return a.name.localeCompare(b.name); },
        "batch-desc": function (a, b) { return b.batch - a.batch; },
        "batch-asc": function (a, b) { return a.batch - b.batch; },
        connections: function (a, b) { return b.connections - a.connections; }
      },
      render: function (items, s) {
        summary.innerHTML = "Showing <strong>" + items.length + "</strong> of " + profiles.length + " people" + (s.q ? " for “" + esc(s.q) + "”" : "");
        u.$("[data-result-count]").textContent = items.length;
        var active = L.activeChips(u.$("#active-filters"), s, {
          role: function (v) { return u.lookup("roles", v); },
          verification: function (v) { return u.lookup("verification", v); },
          department: function (v) { return v; },
          batch: function (v) { return "Batch " + v; },
          skill: function (v) { return v; }
        }, listing);
        u.$("#filter-count").textContent = active || "";

        grid.innerHTML = items.length
          ? items.map(C.profileCard).join("")
          : ui.empty({
              icon: "users",
              title: "No people match your filters",
              text: "Try removing a filter or searching for a broader skill or department.",
              action: '<button type="reset" class="btn btn--primary">Clear all filters</button>'
            });
      }
    });

    document.addEventListener("cc:connection", function () { listing.refresh(); });
  });
});
