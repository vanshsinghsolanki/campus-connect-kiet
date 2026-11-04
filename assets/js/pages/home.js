/** Home page controller */
CC.page("home", function () {
  "use strict";
  var u = CC.utils, ui = CC.ui, C = CC.components, esc = u.escapeHtml;

  var featured = u.$("#featured-people");
  var opps = u.$("#home-opps");
  var events = u.$("#home-events");
  featured.innerHTML = ui.skeletonCards(4);
  opps.innerHTML = ui.skeletonCards(3);
  events.innerHTML = ui.skeletonCards(3);

  // Stats: count up animation
  CC.api.stats().then(function (s) {
    u.$$("[data-stat]").forEach(function (el) {
      var key = el.getAttribute("data-stat");
      var target = s[key] || 0;
      var start = performance.now();
      (function tick(now) {
        var p = Math.min(1, (now - start) / 900);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    });
  });

  CC.api.profiles.list().then(function (profiles) {
    // Hero avatar stack + floating cards
    u.$("#hero-avatars").innerHTML = profiles.slice(0, 5).map(function (p) { return ui.avatar(p, "sm"); }).join("");
    u.$("#hero-trust-text").textContent = "Illustrative sample profiles · not live campus membership data";

    var pick = ["p001", "p002", "p008"].map(function (id) { return profiles.filter(function (p) { return p.id === id; })[0]; }).filter(Boolean);
    u.$("#hero-visual").innerHTML = pick.map(function (p, i) {
      var tags = ['<span class="badge badge--success">Open to referrals</span>', '<span class="badge badge--accent">Mentoring</span>', '<span class="badge badge--primary">Portfolio reviews</span>'];
      return '<div class="card float-card"><div class="mini-row">' + ui.avatar(p, "lg") +
        "<div><strong>" + esc(p.name) + ui.verificationBadge(p.verification, true) + "</strong><span>" + esc(p.headline) + "</span></div></div>" +
        '<div class="badge-row">' + ui.roleBadge(p.role) + tags[i] + "</div></div>";
    }).join("");

    var list = profiles
      .filter(function (p) { return p.verification === "verified" && p.role !== "student"; })
      .slice(0, 4);
    featured.innerHTML = list.map(C.profileCard).join("");
  });

  CC.api.opportunities.list().then(function (items) {
    var open = items
      .filter(function (o) { return u.daysUntil(o.deadline) >= 0; })
      .sort(function (a, b) { return a.deadline.localeCompare(b.deadline); })
      .slice(0, 3);
    opps.innerHTML = open.length ? open.map(C.opportunityCard).join("") : ui.empty({ icon: "briefcase", title: "No open opportunities right now" });
  });

  CC.api.events.list().then(function (items) {
    var upcoming = items
      .filter(function (e) { return u.daysUntil(e.date) >= 0; })
      .sort(function (a, b) { return a.date.localeCompare(b.date); })
      .slice(0, 3);
    events.innerHTML = upcoming.length ? upcoming.map(C.eventCard).join("") : ui.empty({ icon: "calendar", title: "No upcoming events" });
  });

  // Keep connect buttons in sync after a request is sent / withdrawn
  document.addEventListener("cc:connection", function () {
    CC.api.profiles.list().then(function (profiles) {
      featured.innerHTML = profiles.filter(function (p) { return p.verification === "verified" && p.role !== "student"; }).slice(0, 4).map(C.profileCard).join("");
    });
  });
});
