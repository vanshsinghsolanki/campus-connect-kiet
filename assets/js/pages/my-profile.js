/** My Profile (demo dashboard): profile, completion, connections, saved items, activity, settings. */
CC.page("my-profile", function () {
  "use strict";
  if (!CC.layout.requireAuth()) return;

  var u = CC.utils, ui = CC.ui, C = CC.components, esc = u.escapeHtml, icon = CC.icon, api = CC.api;
  var root = u.$("#me-root");
  var TABS = ["overview", "connections", "saved", "activity", "settings"];
  var active = TABS.indexOf(location.hash.slice(1)) > -1 ? location.hash.slice(1) : "overview";

  function completion(me) {
    var checks = [
      { ok: !!me.photo, label: "Add a profile photo", photo: true },
      { ok: !!me.headline, label: "Add a headline" },
      { ok: !!(me.bio && me.bio.length > 20), label: "Write a short bio" },
      { ok: (me.skills || []).length >= 3, label: "Add at least 3 skills" },
      { ok: (me.openTo || []).length > 0, label: "Choose what you're open to" },
      { ok: !!(me.links && (me.links.linkedin || me.links.github)), label: "Add LinkedIn or GitHub" },
      { ok: me.verification === "verified", label: "Verify your profile", href: "verify.html" }
    ];
    var done = checks.filter(function (c) { return c.ok; }).length;
    return { pct: Math.round((done / checks.length) * 100), checks: checks };
  }

  function row(avatarHtml, title, sub, actions) {
    return "<li>" + avatarHtml + "<div><strong>" + title + "</strong><span>" + sub + "</span></div>" + (actions ? '<div class="btn-row">' + actions + "</div>" : "") + "</li>";
  }

  function render() {
    var me = CC.auth.current();
    if (!me) { window.location.replace("login.html"); return; }
    var comp = completion(me);
    var conns = CC.activity.connections();
    var connIds = Object.keys(conns);
    var threads = Object.keys(CC.store.get("messages", {}));
    var saved = {
      opportunities: CC.activity.saved("opportunities").map(api.opportunities.peek).filter(Boolean),
      resources: CC.activity.saved("resources").map(api.resources.peek).filter(Boolean),
      events: CC.activity.saved("events").map(api.events.peek).filter(Boolean)
    };
    var savedCount = saved.opportunities.length + saved.resources.length + saved.events.length;
    var apps = CC.activity.list("applications").map(api.opportunities.peek).filter(Boolean);
    var regs = CC.activity.list("eventRegs").map(api.events.peek).filter(Boolean);
    var calls = CC.activity.calls();
    var theme = CC.store.get("theme", "system");

    document.title = me.name + " (My Profile) · Campus Connect";
    root.setAttribute("aria-busy", "false");
    root.innerHTML =
      '<section class="profile-hero">' +
        '<div class="profile-cover"><div class="container"><nav class="breadcrumbs breadcrumbs--light" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">My Profile</span></nav></div></div>' +
        '<div class="container"><div class="profile-head">' +
          '<div class="avatar-edit">' + ui.avatar({ id: "me", name: me.name }, "xl") +
            '<label class="avatar-edit__btn" title="' + (me.photo ? "Change photo" : "Add photo") + '">' + icon("camera") +
              '<input type="file" id="hero-photo" accept="image/jpeg,image/png,image/webp" aria-label="' + (me.photo ? "Change profile photo" : "Upload profile photo") + '"></label>' +
          "</div>" +
          '<div class="profile-head__id">' +
            "<h1>" + esc(me.name) + ui.verificationBadge(me.verification, true) + "</h1>" +
            "<p>" + esc(me.headline || "Add a headline to introduce yourself") + "</p>" +
            '<div class="badge-row mt-1">' + ui.roleBadge(me.role) + ui.verificationBadge(me.verification) + "</div>" +
            '<div class="profile-head__meta">' +
              (me.department ? "<span>" + icon("graduation") + esc(u.lookup("departments", me.department)) + "</span>" : "") +
              (me.batch ? "<span>" + icon("calendar") + "Batch of " + esc(me.batch) + "</span>" : "") +
              (me.company ? "<span>" + icon("building") + esc(me.company) + "</span>" : "") +
              "<span>" + icon("mail") + esc(me.email) + "</span>" +
            "</div>" +
          "</div>" +
          '<div class="profile-actions">' +
            '<button type="button" class="btn btn--primary" id="edit-profile">' + icon("edit") + "Edit profile</button>" +
            (me.verification !== "verified" ? '<a class="btn btn--outline" href="verify.html">' + icon("shield") + (me.verification === "pending" ? "Check status" : "Get verified") + "</a>" : "") +
          "</div>" +
        "</div></div>" +
      "</section>" +

      '<div class="container"><div class="profile-layout"><div>' +
        '<div class="tabs" role="tablist" aria-label="My profile sections">' +
          tab("overview", "Overview") + tab("connections", "Connections", connIds.length) + tab("saved", "Saved", savedCount) +
          tab("activity", "Activity", apps.length + regs.length + calls.length) + tab("settings", "Settings") +
        "</div>" +

        panel("overview",
          '<div class="panel"><h2>About</h2><p>' + (me.bio ? esc(me.bio) : '<span class="muted">Tell people what you\'re working on and how they can help.</span>') + "</p></div>" +
          '<div class="panel"><h2>Skills</h2>' + ((me.skills || []).length ? ui.chips(me.skills) : '<p class="muted">No skills added yet.</p>') + "</div>" +
          '<div class="panel"><h2>Open to</h2>' + ((me.openTo || []).length ? ui.chips(me.openTo) : '<p class="muted">Not set.</p>') + "</div>" +
          '<div class="panel"><h2>Links</h2><div class="btn-row">' +
            (me.links && me.links.linkedin ? '<a class="btn btn--outline btn--sm" href="' + esc(me.links.linkedin) + '" target="_blank" rel="noopener noreferrer">' + icon("linkedin") + "LinkedIn</a>" : "") +
            (me.links && me.links.github ? '<a class="btn btn--outline btn--sm" href="' + esc(me.links.github) + '" target="_blank" rel="noopener noreferrer">' + icon("github") + "GitHub</a>" : "") +
            (!me.links || !(me.links.linkedin || me.links.github) ? '<p class="muted">No links added.</p>' : "") +
          "</div></div>"
        ) +

        panel("connections",
          '<div class="panel"><h2>Sent requests <span class="badge badge--muted">' + connIds.length + "</span></h2>" +
          (connIds.length ? '<ul class="list-rows">' + connIds.map(function (id) {
            var p = api.profiles.peek(id); if (!p) return "";
            var c = conns[id];
            return row(ui.avatar(p, "md"), '<a href="profile.html?id=' + p.id + '">' + esc(p.name) + "</a>",
              "Pending · " + esc(c.reason || "Connect") + " · " + u.timeAgo(c.at),
              '<button type="button" class="btn btn--outline btn--sm" data-action="message" data-id="' + p.id + '" aria-label="Message ' + esc(p.name) + '">' + icon("message") + '</button><button type="button" class="btn btn--ghost btn--sm" data-action="connect" data-id="' + p.id + '">Withdraw</button>');
          }).join("") + "</ul>"
          : ui.empty({ icon: "user-plus", title: "No connection requests yet", text: "Find seniors and alumni who can guide you.", action: '<a class="btn btn--primary" href="people.html">Explore people</a>' })) +
          "</div>" +
          '<div class="panel"><h2>Conversations <span class="badge badge--muted">' + threads.length + "</span></h2>" +
          (threads.length ? '<ul class="list-rows">' + threads.map(function (id) {
            var p = api.profiles.peek(id); if (!p) return "";
            var msgs = CC.activity.messages(id); var last = msgs[msgs.length - 1];
            return row(ui.avatar(p, "md"), esc(p.name), esc(last ? (last.from === "me" ? "You: " : "") + last.text : ""),
              '<button type="button" class="btn btn--outline btn--sm" data-action="message" data-id="' + p.id + '">Open</button>');
          }).join("") + "</ul>" : '<p class="muted">No messages yet. Open any profile and tap <strong>Message</strong>.</p>') +
          "</div>"
        ) +

        panel("saved",
          savedSection("Saved opportunities", saved.opportunities.map(C.opportunityCard)) +
          savedSection("Saved resources", saved.resources.map(C.resourceCard)) +
          savedSection("Saved events", saved.events.map(C.eventCard)) +
          (savedCount ? "" : ui.empty({ icon: "bookmark", title: "Nothing saved yet", text: "Tap the bookmark icon on any opportunity or resource to save it here.", action: '<a class="btn btn--primary" href="opportunities.html">Browse opportunities</a>' }))
        ) +

        panel("activity",
          '<div class="panel"><h2>Applications <span class="badge badge--muted">' + apps.length + "</span></h2>" +
          (apps.length ? '<ul class="list-rows">' + apps.map(function (o) {
            return row(C.orgLogo(o.org), '<button type="button" class="link-btn" data-action="view-opportunity" data-id="' + o.id + '">' + esc(o.title) + "</button>", esc(o.org) + ' · <span class="badge badge--warning">Submitted (demo)</span>');
          }).join("") + "</ul>" : '<p class="muted">You haven\'t applied to anything yet.</p>') + "</div>" +
          '<div class="panel"><h2>Event registrations <span class="badge badge--muted">' + regs.length + "</span></h2>" +
          (regs.length ? '<ul class="list-rows">' + regs.map(function (e) {
            return row('<span class="type-tile">' + icon("ticket") + "</span>", '<button type="button" class="link-btn" data-action="view-event" data-id="' + e.id + '">' + esc(e.title) + "</button>", u.formatDate(e.date) + " · " + esc(e.time),
              '<button type="button" class="btn btn--ghost btn--sm" data-ics="' + e.id + '" aria-label="Add ' + esc(e.title) + ' to calendar">' + icon("calendar") + "</button>");
          }).join("") + "</ul>" : '<p class="muted">No event registrations yet.</p>') + "</div>" +
          '<div class="panel"><h2>Call requests <span class="badge badge--muted">' + calls.length + "</span></h2>" +
          (calls.length ? '<ul class="list-rows">' + calls.slice().reverse().map(function (c) {
            var p = api.profiles.peek(c.profileId) || { id: c.profileId, name: c.name || "Member" };
            return row(ui.avatar(p, "md"), esc(c.type) + " with " + esc(p.name), u.formatDate(c.date, { day: "numeric", month: "short" }) + " · " + esc(c.slot) + " · " + esc(c.duration) + ' · <span class="badge badge--warning">Awaiting response</span>');
          }).join("") + "</ul>" : '<p class="muted">No call requests yet.</p>') + "</div>"
        ) +

        panel("settings",
          '<div class="panel"><h2>Appearance</h2><div class="choice-chips" role="radiogroup" aria-label="Theme">' +
            ["light", "dark"].map(function (t) {
              return '<label class="choice-chip"><input type="radio" name="theme-pref" value="' + t + '"' + (theme === t ? " checked" : "") + "><span>" + icon(t === "light" ? "sun" : "moon") + u.capitalize(t) + "</span></label>";
            }).join("") + "</div></div>" +
          '<div class="panel"><h2>Notifications <span class="demo-tag">Demo</span></h2><div class="check-list">' +
            '<label class="check"><input type="checkbox" checked><span>Email me when someone accepts my request</span></label>' +
            '<label class="check"><input type="checkbox" checked><span>Weekly digest of new opportunities</span></label>' +
            '<label class="check"><input type="checkbox"><span>Event reminders (24 hours before)</span></label>' +
          "</div></div>" +
          '<div class="panel"><h2>Account</h2><p class="mb-2">All demo data is stored only in this browser.</p><div class="btn-row">' +
            '<button type="button" class="btn btn--outline" data-logout>' + icon("logout") + "Log out</button>" +
            '<button type="button" class="btn btn--outline" id="reset-demo">Reset demo activity</button>' +
            '<button type="button" class="btn btn--danger" id="delete-account">Delete account</button>' +
          "</div></div>"
        ) +
      "</div>" +

      "<aside>" +
        '<div class="panel"><h2>Profile strength <span class="badge badge--primary">' + comp.pct + "%</span></h2>" +
          '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + comp.pct + '" aria-label="Profile completion"><span style="width:' + comp.pct + '%"></span></div>' +
          '<ul class="info-list mt-2">' + comp.checks.map(function (c) {
            return '<li style="' + (c.ok ? "color:var(--text-3)" : "") + '">' + icon(c.ok ? "check" : "plus") + "<div>" +
              (c.ok ? "<s>" + esc(c.label) + "</s>" : c.href ? '<a href="' + c.href + '">' + esc(c.label) + "</a>" : c.photo ? '<label class="link-btn file-btn" style="color:var(--primary-text);cursor:pointer">' + esc(c.label) + '<input type="file" data-photo-input accept="image/jpeg,image/png,image/webp" aria-label="Upload profile photo"></label>' : '<button type="button" class="link-btn" data-edit>' + esc(c.label) + "</button>") + "</div></li>";
          }).join("") + "</ul></div>" +
        '<div class="panel"><h2>Your stats</h2><div class="stat-row">' +
          "<div><strong>" + connIds.length + "</strong><span>Requests</span></div>" +
          "<div><strong>" + savedCount + "</strong><span>Saved</span></div>" +
          "<div><strong>" + (apps.length + regs.length) + "</strong><span>Applied</span></div>" +
        "</div></div>" +
        '<div class="panel"><h2>Quick links</h2><ul class="list-rows">' +
          '<li>' + icon("users") + '<div><a href="people.html">Find mentors</a></div></li>' +
          '<li>' + icon("briefcase") + '<div><a href="opportunities.html">Browse opportunities</a></div></li>' +
          '<li>' + icon("calendar") + '<div><a href="events.html">Upcoming events</a></div></li>' +
        "</ul></div>" +
      "</aside></div></div>";

    bind(me);
  }

  /** Header, drawer and menu avatars were rendered at page load: update them in place. */
  function refreshHeaderAvatars() {
    var me = CC.auth.user();
    u.$$(".user-menu__trigger .avatar, .drawer__user .avatar").forEach(function (a) {
      a.outerHTML = ui.avatar({ id: "me", name: me.name }, a.classList.contains("avatar--sm") ? "sm" : "md");
    });
    u.$$(".user-menu__name").forEach(function (n) { n.textContent = me.name.split(" ")[0]; });
  }

  function tab(key, label, count) {
    return '<button type="button" role="tab" class="tab" id="tab-' + key + '" aria-controls="panel-' + key + '" data-tab="' + key + '" aria-selected="' + (key === active) + '" tabindex="' + (key === active ? 0 : -1) + '">' + label + (count !== undefined ? '<span class="count">' + count + "</span>" : "") + "</button>";
  }
  function panel(key, html) {
    return '<div class="tab-panel" role="tabpanel" id="panel-' + key + '" aria-labelledby="tab-' + key + '" tabindex="0"' + (key === active ? "" : " hidden") + ">" + html + "</div>";
  }
  function savedSection(title, cards) {
    return cards.length ? '<h2 class="mb-2" style="font-size:1.05rem">' + esc(title) + '</h2><div class="grid grid--2 mb-3">' + cards.join("") + "</div>" : "";
  }

  function bind(me) {
    var tabs = u.$$('[role="tab"]', root);
    function select(t, focus) {
      tabs.forEach(function (x) {
        var on = x === t;
        x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1;
        u.$("#" + x.getAttribute("aria-controls")).hidden = !on;
      });
      active = t.getAttribute("data-tab");
      t.parentNode.scrollLeft = t.offsetLeft - (t.parentNode.clientWidth - t.offsetWidth) / 2; // keep active tab visible (horizontal only)
      history.replaceState(null, "", "#" + active);
      if (focus) t.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(t); });
      t.addEventListener("keydown", function (e) {
        var n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (n) { e.preventDefault(); select(tabs[(i + n + tabs.length) % tabs.length], true); }
      });
    });

    // Profile photo upload (hero camera button + checklist item)
    u.$$("#hero-photo, [data-photo-input]", root).forEach(function (input) {
      input.addEventListener("change", function () {
        var file = input.files[0];
        if (!file) return;
        u.imageToDataUrl(file).then(function (dataUrl) {
          CC.auth.saveUser({ photo: dataUrl });
          refreshHeaderAvatars();
          ui.toast("Profile photo updated.");
          render();
        }, function (err) { ui.toast(err.message, { type: "error" }); });
      });
    });

    u.$$("#edit-profile, [data-edit]", root).forEach(function (b) { b.addEventListener("click", function () { editProfile(me); }); });

    u.$$('input[name="theme-pref"]', root).forEach(function (r) {
      r.addEventListener("change", function () { CC.layout.theme.set(r.value); ui.toast("Theme updated."); });
    });

    u.$$("[data-ics]", root).forEach(function (b) {
      b.addEventListener("click", function () { CC.actions.addToCalendar(api.events.peek(b.getAttribute("data-ics"))); });
    });

    u.$$("[data-logout]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        CC.auth.logout();
        CC.store.set("flash", { message: "You have been logged out.", type: "info" });
        window.location.href = "index.html";
      });
    });

    u.$("#reset-demo").addEventListener("click", function () {
      ui.confirm({ title: "Reset demo activity?", message: "This clears connection requests, messages, saved items, applications, registrations and call requests from this browser.", confirmText: "Reset", danger: true })
        .then(function (ok) {
          if (!ok) return;
          ["connections", "messages", "saved", "applications", "eventRegs", "calls"].forEach(CC.store.remove);
          ui.toast("Demo activity cleared.", { type: "info" });
          render();
        });
    });

    u.$("#delete-account").addEventListener("click", function () {
      ui.confirm({ title: "Delete account?", message: "Your demo profile and all activity will be removed from this browser. This cannot be undone.", confirmText: "Delete", danger: true })
        .then(function (ok) {
          if (!ok) return;
          ["user", "session", "verification", "connections", "messages", "saved", "applications", "eventRegs", "calls", "registerDraft"].forEach(CC.store.remove);
          CC.store.set("flash", { message: "Your demo account has been deleted.", type: "info" });
          window.location.href = "index.html";
        });
    });
  }

  function editProfile(me) {
    var meta = api.meta();
    var years = []; for (var y = 2031; y >= 2010; y--) years.push(y);
    var openOptions = ["Mentorship", "Referrals", "Mock Interviews", "Project Collaboration", "Study Groups", "Higher Studies Guidance", "Networking"];
    var skillsCtl;

    ui.modal.open({
      title: "Edit profile",
      subtitle: "Changes are saved in this browser (demo).",
      size: "lg",
      body:
        '<form id="edit-form" class="form" novalidate>' +
          '<div class="field"><span class="field__label">Profile photo</span><div id="edit-photo-root"></div></div>' +
          '<div class="form-grid">' +
            C.field("e-name", "Full name", '<input id="e-name" name="name" required minlength="3" maxlength="60" value="' + esc(me.name) + '">') +
            C.field("e-role", "Member type", '<select id="e-role" name="role" required>' + CC.listingUI.options(meta.roles, me.role) + "</select>") +
            C.field("e-dept", "Department", '<select id="e-dept" name="department" required><option value="">Select</option>' + CC.listingUI.options(meta.departments, me.department) + "</select>") +
            C.field("e-batch", "Batch", '<select id="e-batch" name="batch" required><option value="">Select</option>' + CC.listingUI.options(years, me.batch) + "</select>") +
          "</div>" +
          C.field("e-headline", "Headline", '<input id="e-headline" name="headline" required minlength="10" maxlength="90" value="' + esc(me.headline || "") + '">') +
          C.field("e-company", "Company / organisation (optional)", '<input id="e-company" name="company" maxlength="60" value="' + esc(me.company || "") + '">') +
          C.field("e-bio", "About", '<textarea id="e-bio" name="bio" rows="4" maxlength="400">' + esc(me.bio || "") + "</textarea>") +
          '<div class="field"><label class="field__label" for="edit-skills">Skills</label><div id="edit-skills-root"></div></div>' +
          '<fieldset class="field"><legend class="field__label">Open to</legend><div class="choice-chips">' +
            openOptions.map(function (o) { return '<label class="choice-chip"><input type="checkbox" name="openTo" value="' + esc(o) + '" data-array' + ((me.openTo || []).indexOf(o) > -1 ? " checked" : "") + "><span>" + esc(o) + "</span></label>"; }).join("") +
          "</div></fieldset>" +
          '<div class="form-grid">' +
            C.field("e-linkedin", "LinkedIn URL", '<input id="e-linkedin" name="linkedin" type="url" value="' + esc((me.links || {}).linkedin || "") + '" placeholder="https://linkedin.com/in/…">') +
            C.field("e-github", "GitHub / Portfolio", '<input id="e-github" name="github" type="url" value="' + esc((me.links || {}).github || "") + '" placeholder="https://github.com/…">') +
          "</div>" +
        "</form>",
      footer: '<button type="button" class="btn btn--ghost" data-close>Cancel</button><button type="submit" form="edit-form" class="btn btn--primary">Save changes</button>',
      onOpen: function (el, close) {
        var form = CC.forms.enhance(el.querySelector("#edit-form"));
        var photoCtl = C.photoPicker(el.querySelector("#edit-photo-root"), { id: "edit-photo", value: me.photo || "" });
        skillsCtl = C.tagInput(el.querySelector("#edit-skills-root"), { id: "edit-skills", name: "skills", required: true, values: me.skills || [], suggestions: C.allSkills() });
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          if (!CC.forms.validate(form)) return;
          var d = CC.forms.serialize(form);
          ui.setLoading(el.querySelector("button[type=submit]"), true, "Saving…");
          ui.fakeRequest(600).then(function () {
            CC.auth.saveUser({
              name: d.name.trim(), photo: photoCtl.value(), role: d.role, department: d.department, batch: +d.batch,
              headline: d.headline.trim(), company: (d.company || "").trim(), bio: (d.bio || "").trim(),
              skills: skillsCtl.values(), openTo: [].concat(d.openTo || []),
              links: { linkedin: d.linkedin || "", github: d.github || "" }
            });
            close();
            refreshHeaderAvatars();
            ui.toast("Profile updated.");
            render();
          });
        });
      }
    });
  }

  render();
  ["cc:connection", "cc:saved"].forEach(function (ev) { document.addEventListener(ev, render); });
});
