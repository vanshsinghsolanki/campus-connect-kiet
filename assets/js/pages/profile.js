/** Profile detail page: View Profile + Connect / Message / Call (demo) */
CC.page("people", function () {
  "use strict";
  var u = CC.utils, ui = CC.ui, C = CC.components, esc = u.escapeHtml, icon = CC.icon;
  var root = u.$("#profile-root");
  var id = u.getParam("id");

  function notFound() {
    document.title = "Profile not found · Campus Connect";
    root.setAttribute("aria-busy", "false");
    root.innerHTML = '<div class="container section">' + ui.empty({
      icon: "user",
      title: "Profile not found",
      text: "This profile may have been removed, or the link is incorrect.",
      action: '<a class="btn btn--primary" href="people.html">Browse people</a>'
    }) + "</div>";
  }

  if (!id) return notFound();

  Promise.all([CC.api.profiles.get(id), CC.api.profiles.list(), CC.api.opportunities.list(), CC.api.resources.list(), CC.api.events.list()])
    .then(function (res) {
      var p = res[0], all = res[1], opps = res[2], resources = res[3], events = res[4];
      if (!p) return notFound();

      document.title = p.name + " · Campus Connect";
      var desc = u.$('meta[name="description"]');
      if (desc) desc.setAttribute("content", p.name + ": " + p.headline);

      var myOpps = opps.filter(function (o) { return o.postedBy === p.id; });
      var myRes = resources.filter(function (r) { return r.author === p.id; });
      var myEvents = events.filter(function (e) { return (e.speakers || []).indexOf(p.id) > -1; });
      var similar = all.filter(function (x) {
        return x.id !== p.id && (x.department === p.department || x.skills.some(function (s) { return p.skills.indexOf(s) > -1; }));
      }).slice(0, 4);

      function render() {
        var conn = CC.activity.connection(p.id);
        root.setAttribute("aria-busy", "false");
        root.innerHTML =
          '<section class="profile-hero">' +
            '<div class="profile-cover"><div class="container">' +
              '<nav class="breadcrumbs breadcrumbs--light" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span><a href="people.html">People</a><span aria-hidden="true">/</span><span aria-current="page">' + esc(p.name) + "</span></nav>" +
            "</div></div>" +
            '<div class="container">' +
              '<div class="profile-head">' +
                ui.avatar(p, "xl") +
                '<div class="profile-head__id">' +
                  "<h1>" + esc(p.name) + ui.verificationBadge(p.verification, true) + "</h1>" +
                  "<p>" + esc(p.headline) + "</p>" +
                  '<div class="badge-row mt-1">' + ui.roleBadge(p.role) + ui.verificationBadge(p.verification) +
                    (p.callAvailable ? '<span class="badge badge--accent">' + icon("phone") + "Open to calls</span>" : "") + "</div>" +
                  '<div class="profile-head__meta">' +
                    "<span>" + icon("graduation") + esc(u.lookup("departments", p.department)) + "</span>" +
                    "<span>" + icon("calendar") + "Batch of " + p.batch + "</span>" +
                    "<span>" + icon("pin") + esc(p.location) + "</span>" +
                    "<span>" + icon("users") + u.formatNumber(p.connections) + " connections</span>" +
                  "</div>" +
                "</div>" +
                '<div class="profile-actions">' +
                  C.connectButton(p) +
                  '<button type="button" class="btn btn--outline" data-action="message" data-id="' + p.id + '">' + icon("message") + "Message</button>" +
                  '<button type="button" class="btn btn--outline" data-action="call" data-id="' + p.id + '">' + icon("phone") + "Request call</button>" +
                  '<button type="button" class="btn btn--ghost btn--icon" id="share-profile" aria-label="Share profile">' + icon("share") + "</button>" +
                "</div>" +
              "</div>" +
            "</div>" +
          "</section>" +

          '<div class="container">' +
            '<div class="profile-layout">' +
              '<div>' +
                '<div class="tabs" role="tablist" aria-label="Profile sections">' +
                  tab("about", "About", true) +
                  tab("experience", "Experience", false, p.experience.length) +
                  tab("skills", "Skills", false, p.skills.length) +
                  tab("activity", "Activity", false, myOpps.length + myRes.length + myEvents.length) +
                "</div>" +

                panel("about", true,
                  '<div class="panel"><h2>About</h2><p>' + esc(p.bio) + "</p></div>" +
                  '<div class="panel"><h2>Open to</h2>' + ui.chips(p.openTo) + "</div>" +
                  (p.achievements.length ? '<div class="panel"><h2>Achievements</h2><ul class="info-list">' + p.achievements.map(function (a) { return "<li>" + icon("award") + "<div>" + esc(a) + "</div></li>"; }).join("") + "</ul></div>" : "")
                ) +

                panel("experience", false,
                  '<div class="panel"><h2>Experience</h2>' +
                  (p.experience.length
                    ? '<ol class="timeline">' + p.experience.map(function (x) { return "<li><strong>" + esc(x.title) + "</strong><span>" + esc(x.org) + " · " + esc(x.period) + "</span></li>"; }).join("") + "</ol>"
                    : '<p class="muted">No experience added yet.</p>') +
                  '</div><div class="panel"><h2>Education</h2><ol class="timeline"><li><strong>' + esc(u.lookup("departments", p.department)) + "</strong><span>KIET Deemed to be University · Batch of " + p.batch + "</span></li></ol></div>"
                ) +

                panel("skills", false, '<div class="panel"><h2>Skills</h2>' + ui.chips(p.skills) + "</div>") +

                panel("activity", false,
                  section("Opportunities shared", myOpps.map(C.opportunityCard)) +
                  section("Resources shared", myRes.map(C.resourceCard)) +
                  section("Speaking at events", myEvents.map(C.eventCard)) +
                  (myOpps.length + myRes.length + myEvents.length === 0 ? ui.empty({ icon: "sparkles", title: "No activity yet", text: p.name.split(" ")[0] + " hasn't shared anything yet." }) : "")
                ) +
              "</div>" +

              "<aside>" +
                '<div class="panel"><h2>Contact</h2><ul class="info-list">' +
                  "<li>" + icon("mail") + "<div><span>Email</span>" + (conn ? esc(p.email) : '<span class="blurred" aria-hidden="true">' + esc(p.email) + '</span><small class="muted">Visible after connecting</small>') + "</div></li>" +
                  "<li>" + icon("phone") + "<div><span>Phone</span>" + esc(p.phone) + "</div></li>" +
                  (p.company ? "<li>" + icon("building") + "<div><span>Company</span>" + esc(p.company) + "</div></li>" : "") +
                "</ul>" +
                '<div class="btn-row mt-2">' +
                  (p.links.linkedin ? '<a class="btn btn--outline btn--sm" href="' + esc(p.links.linkedin) + '" aria-label="LinkedIn profile (demo link)">' + icon("linkedin") + "LinkedIn</a>" : "") +
                  (p.links.github ? '<a class="btn btn--outline btn--sm" href="' + esc(p.links.github) + '" aria-label="GitHub profile (demo link)">' + icon("github") + "GitHub</a>" : "") +
                "</div></div>" +

                '<div class="panel"><h2>At a glance</h2><div class="stat-row">' +
                  "<div><strong>" + u.formatNumber(p.connections) + "</strong><span>Connections</span></div>" +
                  "<div><strong>" + myOpps.length + "</strong><span>Opportunities</span></div>" +
                  "<div><strong>" + myRes.length + "</strong><span>Resources</span></div>" +
                "</div></div>" +

                (conn ? '<div class="panel"><p class="notice notice--warning">' + icon("clock") + "<span>Connection request pending since " + u.timeAgo(conn.at) + ". Reason: " + esc(conn.reason || "—") + ".</span></p></div>" : "") +

                (similar.length ? '<div class="panel"><h2>Similar profiles</h2><ul class="list-rows">' + similar.map(function (s) {
                  return "<li>" + ui.avatar(s, "md") + '<div><strong><a href="profile.html?id=' + s.id + '">' + esc(s.name) + "</a>" + ui.verificationBadge(s.verification, true) + "</strong><span>" + esc(s.headline) + "</span></div></li>";
                }).join("") + "</ul></div>" : "") +
              "</aside>" +
            "</div>" +
          "</div>";

        bindTabs();
        u.$("#share-profile").addEventListener("click", function () { CC.share(p.name + " on Campus Connect", "profile.html?id=" + p.id); });
      }

      var activeTab = (window.location.hash || "#about").slice(1);

      function tab(key, label, selected, count) {
        return '<button type="button" role="tab" class="tab" id="tab-' + key + '" aria-controls="panel-' + key + '" data-tab="' + key + '" aria-selected="' + (key === activeTab || (selected && ["about", "experience", "skills", "activity"].indexOf(activeTab) === -1)) + '" tabindex="-1">' + label + (count !== undefined ? '<span class="count">' + count + "</span>" : "") + "</button>";
      }
      function panel(key, selected, html) {
        return '<div class="tab-panel" role="tabpanel" id="panel-' + key + '" aria-labelledby="tab-' + key + '" tabindex="0">' + html + "</div>";
      }
      function section(title, cards) {
        return cards.length ? '<h2 class="mt-2 mb-2" style="font-size:1.05rem">' + esc(title) + '</h2><div class="grid grid--2 mb-3">' + cards.join("") + "</div>" : "";
      }

      function bindTabs() {
        var tabs = u.$$('[role="tab"]', root);
        function select(t, focus) {
          tabs.forEach(function (x) {
            var on = x === t;
            x.setAttribute("aria-selected", String(on));
            x.tabIndex = on ? 0 : -1;
            u.$("#" + x.getAttribute("aria-controls")).hidden = !on;
          });
          activeTab = t.getAttribute("data-tab");
          t.parentNode.scrollLeft = t.offsetLeft - (t.parentNode.clientWidth - t.offsetWidth) / 2; // keep active tab visible (horizontal only)
          history.replaceState(null, "", "#" + activeTab);
          if (focus) t.focus();
        }
        tabs.forEach(function (t, i) {
          t.addEventListener("click", function () { select(t); });
          t.addEventListener("keydown", function (e) {
            var n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
            if (n) { e.preventDefault(); select(tabs[(i + n + tabs.length) % tabs.length], true); }
          });
        });
        var current = tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || tabs[0];
        select(current);
      }

      render();
      document.addEventListener("cc:connection", render);
    })
    .catch(function (err) {
      console.error(err);
      notFound();
    });
});
