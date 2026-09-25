/**
 * Campus Connect — Shared Components & Actions (Phase 1)
 * ------------------------------------------------------------------
 * CC.components – pure render functions returning HTML strings (cards).
 * CC.actions    – demo interaction flows shown in modals:
 *                 connect, message, call, opportunity view/apply,
 *                 resource view/download, event view/register.
 *
 * Any element with [data-action="..."][data-id="..."] anywhere on a page
 * triggers the matching action through a single delegated listener.
 */
(function () {
  "use strict";

  var CC = window.CC;
  var u = CC.utils, ui = CC.ui, esc = u.escapeHtml, icon = CC.icon;
  var api = CC.api;

  /* ================================================================
   * Card renderers
   * ============================================================== */
  var C = (CC.components = {});

  C.connectButton = function (p, size) {
    var conn = CC.activity.connection(p.id);
    var sz = size ? " btn--" + size : "";
    if (conn) {
      return '<button type="button" class="btn btn--soft' + sz + '" data-action="connect" data-id="' + p.id + '" aria-label="Connection request pending — click to manage">' + icon("clock") + "Pending</button>";
    }
    return '<button type="button" class="btn btn--primary' + sz + '" data-action="connect" data-id="' + p.id + '">' + icon("user-plus") + "Connect</button>";
  };

  C.profileCard = function (p) {
    return '<article class="card profile-card">' +
      '<div class="profile-card__top">' +
        ui.avatar(p, "lg") +
        '<div class="profile-card__id">' +
          '<h3 class="profile-card__name"><a href="profile.html?id=' + p.id + '" class="stretched">' + esc(p.name) + "</a>" + ui.verificationBadge(p.verification, true) + "</h3>" +
          '<p class="profile-card__meta">' + esc(p.department) + " · Batch " + p.batch + "</p>" +
        "</div>" +
      "</div>" +
      '<div class="profile-card__badges">' + ui.roleBadge(p.role) + (p.verification !== "verified" ? ui.verificationBadge(p.verification) : "") + "</div>" +
      '<p class="profile-card__headline">' + esc(p.headline) + "</p>" +
      ui.chips(p.skills, 3) +
      '<div class="card__actions">' +
        '<a class="btn btn--outline btn--sm" href="profile.html?id=' + p.id + '">View profile</a>' +
        C.connectButton(p, "sm") +
      "</div>" +
    "</article>";
  };

  var CATEGORY_ICON = { internship: "graduation", job: "briefcase", hackathon: "code", certification: "award" };
  var RESOURCE_ICON = { notes: "file", video: "video", ebook: "book", roadmap: "map", paper: "file", course: "layers" };
  var EVENT_ICON = { workshop: "code", webinar: "mic", hackathon: "trophy", meetup: "users", seminar: "graduation", fest: "sparkles" };

  function saveButton(kind, id, label) {
    var saved = CC.activity.isSaved(kind, id);
    return '<button type="button" class="icon-btn save-btn' + (saved ? " is-active" : "") + '" data-action="save" data-kind="' + kind + '" data-id="' + id + '" aria-pressed="' + saved + '" aria-label="' + (saved ? "Remove from saved" : "Save") + " " + esc(label) + '">' + icon("bookmark") + "</button>";
  }
  C.saveButton = saveButton;

  C.orgLogo = function (name) {
    return '<span class="org-logo" style="--av-h:' + u.hue(name) + '" aria-hidden="true">' + esc(u.initials(name)) + "</span>";
  };

  C.opportunityCard = function (o) {
    var dl = u.relativeDeadline(o.deadline);
    var applied = CC.activity.has("applications", o.id);
    return '<article class="card opp-card">' +
      '<div class="opp-card__head">' + C.orgLogo(o.org) +
        '<div class="opp-card__title"><h3><button type="button" class="link-btn stretched" data-action="view-opportunity" data-id="' + o.id + '">' + esc(o.title) + "</button></h3>" +
        "<p>" + esc(o.org) + "</p></div>" + saveButton("opportunities", o.id, o.title) +
      "</div>" +
      '<div class="badge-row"><span class="badge badge--primary">' + icon(CATEGORY_ICON[o.category]) + esc(u.lookup("opportunityCategories", o.category).replace(/s$/, "")) + "</span>" +
        '<span class="badge badge--muted">' + esc(cap(o.mode)) + "</span></div>" +
      '<ul class="meta-list">' +
        "<li>" + icon("pin") + esc(o.location) + "</li>" +
        "<li>" + icon("sparkles") + esc(o.stipend) + "</li>" +
        '<li class="tone-' + dl.tone + '">' + icon("clock") + esc(dl.label) + " · " + u.formatDate(o.deadline, { day: "numeric", month: "short" }) + "</li>" +
      "</ul>" +
      '<div class="card__actions">' +
        '<button type="button" class="btn btn--outline btn--sm" data-action="view-opportunity" data-id="' + o.id + '">Details</button>' +
        (applied
          ? '<span class="btn btn--soft btn--sm is-static">' + icon("check") + "Applied</span>"
          : u.daysUntil(o.deadline) < 0
            ? '<span class="btn btn--soft btn--sm is-static">Closed</span>'
            : '<button type="button" class="btn btn--primary btn--sm" data-action="apply" data-id="' + o.id + '">Apply</button>') +
      "</div>" +
    "</article>";
  };

  C.resourceCard = function (r) {
    var author = api.profiles.peek(r.author);
    return '<article class="card resource-card">' +
      '<div class="resource-card__head"><span class="type-tile type-tile--' + r.type + '">' + icon(RESOURCE_ICON[r.type]) + "</span>" +
        '<div><span class="eyebrow">' + esc(u.lookup("resourceTypes", r.type)) + " · " + esc(r.department) + "</span>" +
        '<h3><button type="button" class="link-btn stretched" data-action="view-resource" data-id="' + r.id + '">' + esc(r.title) + "</button></h3></div>" +
        saveButton("resources", r.id, r.title) +
      "</div>" +
      '<p class="resource-card__desc">' + esc(r.description) + "</p>" +
      '<ul class="meta-list meta-list--inline">' +
        "<li>" + icon("book") + esc(r.subject) + "</li>" +
        "<li>" + icon("download") + u.formatNumber(r.downloads) + "</li>" +
        (author ? "<li>" + icon("user") + esc(author.name) + "</li>" : "") +
      "</ul>" +
      '<div class="card__actions">' +
        '<button type="button" class="btn btn--outline btn--sm" data-action="view-resource" data-id="' + r.id + '">View</button>' +
        '<a class="btn btn--primary btn--sm" href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + icon("external") + "Open</a>" +
      "</div>" +
    "</article>";
  };

  function eventState(e) {
    if (u.daysUntil(e.date) < 0) return "past";
    if (CC.activity.has("eventRegs", e.id)) return "registered";
    if (e.registered >= e.seats) return "full";
    return "open";
  }
  C.eventState = eventState;

  C.eventRegisterButton = function (e, size) {
    var sz = size ? " btn--" + size : "";
    var s = eventState(e);
    if (s === "past") return '<span class="btn btn--soft' + sz + ' is-static">Event ended</span>';
    if (s === "registered") return '<span class="btn btn--soft' + sz + ' is-static">' + icon("check") + "Registered</span>";
    if (s === "full") return '<span class="btn btn--soft' + sz + ' is-static">Seats full</span>';
    return '<button type="button" class="btn btn--primary' + sz + '" data-action="register-event" data-id="' + e.id + '">Register</button>';
  };

  C.eventCard = function (e) {
    var d = u.parseDate(e.date);
    var pct = Math.min(100, Math.round((e.registered / e.seats) * 100));
    var past = u.daysUntil(e.date) < 0;
    return '<article class="card event-card' + (past ? " is-past" : "") + '">' +
      '<div class="event-card__head">' +
        '<div class="date-block" aria-hidden="true"><span>' + d.toLocaleDateString("en-IN", { month: "short" }) + "</span><strong>" + d.getDate() + "</strong></div>" +
        '<div><div class="badge-row"><span class="badge badge--accent">' + icon(EVENT_ICON[e.type]) + esc(u.lookup("eventTypes", e.type)) + "</span>" +
        '<span class="badge badge--muted">' + esc(cap(e.mode)) + "</span></div>" +
        '<h3><button type="button" class="link-btn stretched" data-action="view-event" data-id="' + e.id + '">' + esc(e.title) + "</button></h3></div>" +
      "</div>" +
      '<ul class="meta-list">' +
        "<li>" + icon("calendar") + '<time datetime="' + e.date + '">' + u.formatDate(e.date, { weekday: "short", day: "numeric", month: "short", year: "numeric" }) + "</time></li>" +
        "<li>" + icon("clock") + esc(e.time) + "</li>" +
        "<li>" + icon("pin") + esc(e.venue) + "</li>" +
      "</ul>" +
      '<div class="seats"><div class="seats__bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + e.seats + '" aria-valuenow="' + e.registered + '" aria-label="Seats filled"><span style="width:' + pct + '%"></span></div>' +
        "<small>" + u.formatNumber(e.registered) + " / " + u.formatNumber(e.seats) + " registered</small></div>" +
      '<div class="card__actions">' +
        '<button type="button" class="btn btn--outline btn--sm" data-action="view-event" data-id="' + e.id + '">Details</button>' +
        C.eventRegisterButton(e, "sm") +
      "</div>" +
    "</article>";
  };

  function cap(s) { return String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1); }
  u.capitalize = cap;

  /* ================================================================
   * Shared helpers for actions
   * ============================================================== */
  function emit(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail: detail }));
  }

  function share(title, path) {
    var url = new URL(path, window.location.href).href;
    if (navigator.share) {
      navigator.share({ title: title, url: url }).catch(function () { /* user cancelled */ });
    } else {
      u.copyText(url).then(function () { ui.toast("Link copied to clipboard."); }, function () { ui.toast(url, { type: "info", title: "Copy this link" }); });
    }
  }
  CC.share = share;

  function currentUser() { return CC.auth.current() || {}; }

  function successView(title, text, extra) {
    return '<div class="success-view">' +
      '<div class="success-view__icon">' + icon("check") + "</div>" +
      "<h3>" + esc(title) + "</h3><p>" + esc(text) + "</p>" + (extra || "") + "</div>";
  }

  function personHeader(p) {
    return '<div class="person-row">' + ui.avatar(p, "md") +
      "<div><strong>" + esc(p.name) + "</strong> " + ui.verificationBadge(p.verification, true) +
      "<span>" + esc(p.headline) + "</span></div></div>";
  }

  /* ================================================================
   * Actions
   * ============================================================== */
  var A = (CC.actions = {});

  /* ---------- Connect ---------- */
  A.connect = function (p) {
    var existing = CC.activity.connection(p.id);
    if (existing) {
      ui.confirm({
        title: "Withdraw request?",
        message: "Your connection request to " + p.name + " is pending (sent " + u.timeAgo(existing.at) + "). Do you want to withdraw it?",
        confirmText: "Withdraw", danger: true
      }).then(function (ok) {
        if (!ok) return;
        CC.activity.withdrawConnection(p.id);
        ui.toast("Connection request withdrawn.", { type: "info" });
        emit("cc:connection", { id: p.id });
      });
      return;
    }

    var reasons = ["Mentorship", "Referral", "Project collaboration", "Career advice", "Just connecting"];
    ui.modal.open({
      title: "Connect with " + p.name.split(" ")[0],
      subtitle: "Add a short note so they know why you're reaching out.",
      body:
        personHeader(p) +
        '<form id="connect-form" class="form" novalidate>' +
          '<fieldset class="field"><legend class="field__label">Reason for connecting</legend><div class="choice-chips">' +
            reasons.map(function (r, i) {
              return '<label class="choice-chip"><input type="radio" name="reason" value="' + esc(r) + '"' + (i === 0 ? " checked" : "") + "><span>" + esc(r) + "</span></label>";
            }).join("") +
          "</div></fieldset>" +
          '<div class="field"><label class="field__label" for="connect-note">Personal note <span class="optional">(optional)</span></label>' +
            '<textarea id="connect-note" name="note" rows="4" maxlength="300" placeholder="Hi ' + esc(p.name.split(" ")[0]) + ", I'm a student in " + esc(currentUser().department || "your department") + ' and would love to learn from your experience…"></textarea>' +
            '<p class="field__hint"><span data-count>0</span>/300</p></div>' +
          '<p class="notice notice--info">' + icon("info") + "<span>Demo only: the request is saved in this browser. Real requests arrive in Phase 2.</span></p>" +
        "</form>",
      footer: '<button type="button" class="btn btn--ghost" data-close>Cancel</button>' +
              '<button type="submit" form="connect-form" class="btn btn--primary">' + icon("send") + "Send request</button>",
      onOpen: function (el, close) {
        var form = el.querySelector("#connect-form");
        var note = form.querySelector("#connect-note");
        var count = form.querySelector("[data-count]");
        note.addEventListener("input", function () { count.textContent = note.value.length; });
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          var btn = el.querySelector('button[type=submit]');
          ui.setLoading(btn, true, "Sending…");
          ui.fakeRequest(700).then(function () {
            var data = CC.forms.serialize(form);
            CC.activity.requestConnection(p.id, { reason: data.reason, note: data.note, name: p.name });
            el.querySelector(".modal__body").innerHTML = successView("Request sent!", p.name + " will see your request once messaging goes live in Phase 2. You can track it on your profile.",
              '<div class="btn-row"><button type="button" class="btn btn--outline" data-action="message" data-id="' + p.id + '">' + icon("message") + 'Send a message</button></div>');
            el.querySelector(".modal__footer").innerHTML = '<button type="button" class="btn btn--primary" data-close>Done</button>';
            emit("cc:connection", { id: p.id });
          });
        });
      }
    });
  };

  /* ---------- Message (demo chat) ---------- */
  A.message = function (p) {
    if (ui.modal.isOpen()) {
      ui.modal.closeAll();
      setTimeout(function () { A.message(p); }, 220);
      return;
    }
    var quick = [
      "Hi! Could you guide me on preparing for internships?",
      "Would you be open to reviewing my resume?",
      "Can we schedule a quick 15-min call?"
    ];
    function bubble(m) {
      return '<div class="bubble bubble--' + (m.from === "me" ? "me" : "them") + '"><p>' + esc(m.text) + "</p><time>" + u.timeAgo(m.at) + "</time></div>";
    }
    function thread() {
      var msgs = CC.activity.messages(p.id);
      if (!msgs.length) {
        return '<div class="chat__empty">' + ui.avatar(p, "lg") + "<p>Start a conversation with <strong>" + esc(p.name) + "</strong>.<br>Be specific about what you'd like help with.</p></div>";
      }
      return msgs.map(bubble).join("");
    }

    ui.modal.open({
      title: p.name,
      subtitle: p.headline,
      size: "md",
      body:
        '<div class="chat">' +
          '<p class="notice notice--info">' + icon("info") + "<span>Messaging demo: messages stay in this browser. Real-time chat is planned for Phase 2.</span></p>" +
          '<div class="chat__thread" aria-live="polite">' + thread() + "</div>" +
          '<div class="chat__quick" aria-label="Quick messages">' + quick.map(function (q) { return '<button type="button" class="chip chip--btn" data-quick>' + esc(q) + "</button>"; }).join("") + "</div>" +
          '<form class="chat__composer" id="chat-form">' +
            '<label for="chat-input" class="sr-only">Message</label>' +
            '<textarea id="chat-input" rows="1" maxlength="500" placeholder="Write a message…" required></textarea>' +
            '<button type="submit" class="btn btn--primary btn--icon" aria-label="Send message">' + icon("send") + "</button>" +
          "</form>" +
        "</div>",
      onOpen: function (el) {
        var threadEl = el.querySelector(".chat__thread");
        var input = el.querySelector("#chat-input");
        var form = el.querySelector("#chat-form");
        var scroll = function () { threadEl.scrollTop = threadEl.scrollHeight; };
        scroll();
        input.focus();

        function send(text) {
          text = text.trim();
          if (!text) return;
          CC.activity.addMessage(p.id, { from: "me", text: text });
          threadEl.innerHTML = thread();
          input.value = "";
          input.style.height = "";
          scroll();
          var typing = document.createElement("div");
          typing.className = "bubble bubble--them bubble--typing";
          typing.innerHTML = "<span></span><span></span><span></span>";
          setTimeout(function () { threadEl.appendChild(typing); scroll(); }, 400);
          setTimeout(function () {
            CC.activity.addMessage(p.id, { from: "them", text: "Thanks for reaching out! (Auto-reply demo) I'll get back to you soon. 🙂" });
            threadEl.innerHTML = thread();
            scroll();
          }, 1600);
        }
        form.addEventListener("submit", function (e) { e.preventDefault(); send(input.value); });
        input.addEventListener("keydown", function (e) {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input.value); }
        });
        input.addEventListener("input", function () {
          input.style.height = "auto";
          input.style.height = Math.min(input.scrollHeight, 140) + "px";
        });
        u.$$("[data-quick]", el).forEach(function (b) {
          b.addEventListener("click", function () { input.value = b.textContent; input.focus(); });
        });
      }
    });
  };

  /* ---------- Request a call ---------- */
  A.call = function (p) {
    var tomorrow = u.today(); tomorrow.setDate(tomorrow.getDate() + 1);
    var max = u.today(); max.setDate(max.getDate() + 30);
    var iso = function (d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
    var slots = ["10:00 AM", "12:30 PM", "4:00 PM", "6:30 PM", "8:00 PM"];
    var user = currentUser();

    ui.modal.open({
      title: "Request a call",
      subtitle: "Propose a time. " + p.name.split(" ")[0] + " can accept or suggest another slot.",
      body:
        personHeader(p) +
        (p.callAvailable ? "" : '<p class="notice notice--warning">' + icon("alert") + "<span>" + esc(p.name.split(" ")[0]) + " usually prefers messages first. Your request may take longer to be accepted.</span></p>") +
        '<form id="call-form" class="form" novalidate>' +
          '<fieldset class="field"><legend class="field__label">Call type</legend><div class="option-cards option-cards--2">' +
            '<label class="option-card"><input type="radio" name="type" value="Voice call" checked><span>' + icon("phone") + "<strong>Voice call</strong><small>Phone / audio</small></span></label>" +
            '<label class="option-card"><input type="radio" name="type" value="Video call"><span>' + icon("video") + "<strong>Video call</strong><small>Google Meet link</small></span></label>" +
          "</div></fieldset>" +
          '<div class="form-grid">' +
            '<div class="field"><label class="field__label" for="call-date">Preferred date</label><input type="date" id="call-date" name="date" required min="' + iso(tomorrow) + '" max="' + iso(max) + '" value="' + iso(tomorrow) + '"></div>' +
            '<div class="field"><label class="field__label" for="call-duration">Duration</label><select id="call-duration" name="duration"><option>15 minutes</option><option selected>30 minutes</option><option>45 minutes</option></select></div>' +
          "</div>" +
          '<fieldset class="field"><legend class="field__label">Time slot</legend><div class="choice-chips">' +
            slots.map(function (s, i) { return '<label class="choice-chip"><input type="radio" name="slot" value="' + s + '"' + (i === 2 ? " checked" : "") + "><span>" + s + "</span></label>"; }).join("") +
          "</div></fieldset>" +
          '<div class="field"><label class="field__label" for="call-topic">What would you like to discuss?</label>' +
            '<textarea id="call-topic" name="topic" rows="3" required minlength="10" maxlength="400" placeholder="e.g. Guidance on preparing for SDE internships and choosing projects"></textarea></div>' +
          '<div class="field"><label class="field__label" for="call-phone">Your phone number <span class="optional">(optional)</span></label>' +
            '<input type="tel" id="call-phone" name="phone" inputmode="tel" pattern="[0-9+\\s\\-]{10,15}" title="Enter a valid phone number (10–15 digits)" placeholder="+91 98765 43210" value="' + esc(user.phone || "") + '"></div>' +
        "</form>",
      footer: '<button type="button" class="btn btn--ghost" data-close>Cancel</button>' +
              '<button type="submit" form="call-form" class="btn btn--primary">' + icon("phone") + "Send call request</button>",
      onOpen: function (el) {
        var form = CC.forms.enhance(el.querySelector("#call-form"));
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          if (!CC.forms.validate(form)) return;
          var data = CC.forms.serialize(form);
          var btn = el.querySelector("button[type=submit]");
          ui.setLoading(btn, true, "Sending…");
          ui.fakeRequest(800).then(function () {
            CC.activity.addCall(Object.assign({ profileId: p.id, name: p.name }, data));
            el.querySelector(".modal__body").innerHTML = successView("Call requested",
              data.type + " on " + u.formatDate(data.date, { weekday: "long", day: "numeric", month: "long" }) + " at " + data.slot + " (" + data.duration + "). You'll be notified when " + p.name.split(" ")[0] + " responds (Phase 2).");
            el.querySelector(".modal__footer").innerHTML = '<button type="button" class="btn btn--primary" data-close>Done</button>';
          });
        });
      }
    });
  };

  /* ---------- Opportunity detail ---------- */
  A.viewOpportunity = function (o) {
    var poster = api.profiles.peek(o.postedBy);
    var dl = u.relativeDeadline(o.deadline);
    var applied = CC.activity.has("applications", o.id);
    var closed = u.daysUntil(o.deadline) < 0;
    ui.modal.open({
      title: o.title,
      subtitle: o.org + " · " + cap(o.mode) + " · " + o.location,
      size: "lg",
      body:
        '<div class="detail">' +
          '<div class="detail__facts">' +
            fact("briefcase", "Category", u.lookup("opportunityCategories", o.category).replace(/s$/, "")) +
            fact("sparkles", "Stipend / Pay", o.stipend) +
            fact("clock", "Duration", o.duration) +
            fact("calendar", "Apply by", u.formatDate(o.deadline) + ' <span class="tone-' + dl.tone + '">(' + dl.label + ")</span>", true) +
          "</div>" +
          "<h3>About the opportunity</h3><p>" + esc(o.description) + "</p>" +
          "<h3>Eligibility</h3><p>" + esc(o.eligibility) + "</p>" +
          "<h3>Skills & tags</h3>" + ui.chips(o.tags) +
          (poster ? "<h3>Shared by</h3>" + '<a class="person-row person-row--link" href="profile.html?id=' + poster.id + '">' + ui.avatar(poster, "md") + "<div><strong>" + esc(poster.name) + "</strong> " + ui.verificationBadge(poster.verification, true) + "<span>" + esc(poster.headline) + "</span></div>" + icon("chevron-right") + "</a>" : "") +
        "</div>",
      footer:
        '<button type="button" class="btn btn--ghost" data-share>' + icon("share") + "Share</button>" +
        '<button type="button" class="btn btn--outline" data-save>' + icon("bookmark") + '<span>' + (CC.activity.isSaved("opportunities", o.id) ? "Saved" : "Save") + "</span></button>" +
        (applied ? '<span class="btn btn--soft is-static">' + icon("check") + "Applied</span>"
          : closed ? '<span class="btn btn--soft is-static">Applications closed</span>'
          : '<button type="button" class="btn btn--primary" data-action="apply" data-id="' + o.id + '">Apply now ' + icon("arrow-right") + "</button>"),
      onOpen: function (el) {
        el.querySelector("[data-share]").addEventListener("click", function () { share(o.title, "opportunities.html?id=" + o.id); });
        el.querySelector("[data-save]").addEventListener("click", function (e) {
          var now = CC.activity.toggleSaved("opportunities", o.id);
          e.currentTarget.querySelector("span").textContent = now ? "Saved" : "Save";
          ui.toast(now ? "Saved to your profile." : "Removed from saved.", { type: now ? "success" : "info" });
          emit("cc:saved", { kind: "opportunities", id: o.id });
        });
      }
    });
  };

  function fact(ic, label, value, raw) {
    return '<div class="fact">' + icon(ic) + "<div><span>" + esc(label) + "</span><strong>" + (raw ? value : esc(value)) + "</strong></div></div>";
  }

  /* ---------- Apply (demo) ---------- */
  A.apply = function (o) {
    ui.modal.closeAll();
    var user = currentUser();
    setTimeout(function () {
      ui.modal.open({
        title: "Apply: " + o.title,
        subtitle: o.org + " · Demo application: nothing is sent to the organisation.",
        body:
          '<form id="apply-form" class="form" novalidate>' +
            '<div class="form-grid">' +
              field("apply-name", "Full name", '<input id="apply-name" name="name" required minlength="3" autocomplete="name" value="' + esc(user.name || "") + '">') +
              field("apply-email", "Email", '<input id="apply-email" type="email" name="email" required autocomplete="email" value="' + esc(user.email || "") + '">') +
              field("apply-phone", "Phone", '<input id="apply-phone" type="tel" name="phone" required inputmode="tel" pattern="[0-9+\\s\\-]{10,15}" title="Enter a valid phone number (10–15 digits)" autocomplete="tel">') +
              field("apply-batch", "Batch / Year", '<select id="apply-batch" name="batch" required><option value="">Select</option>' + [2026, 2027, 2028, 2029, 2030].map(function (y) { return "<option" + (+user.batch === y ? " selected" : "") + ">" + y + "</option>"; }).join("") + "</select>") +
            "</div>" +
            field("apply-resume", "Resume link", '<input id="apply-resume" type="url" name="resume" required placeholder="https://drive.google.com/…">', "Share a public Google Drive / Dropbox link.") +
            field("apply-cover", "Why are you a good fit?", '<textarea id="apply-cover" name="cover" rows="4" required minlength="30" maxlength="800" placeholder="A few lines about your skills, projects and interest in this role."></textarea>') +
            '<div class="field field--check"><label class="check"><input type="checkbox" name="consent" required><span>I confirm the information above is accurate.</span></label></div>' +
          "</form>",
        footer: '<button type="button" class="btn btn--ghost" data-close>Cancel</button><button type="submit" form="apply-form" class="btn btn--primary">Submit application</button>',
        onOpen: function (el) {
          var form = CC.forms.enhance(el.querySelector("#apply-form"));
          form.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!CC.forms.validate(form)) return;
            ui.setLoading(el.querySelector("button[type=submit]"), true, "Submitting…");
            ui.fakeRequest(900).then(function () {
              CC.activity.addTo("applications", o.id);
              window.location.href = "thank-you.html?type=application&ref=" + encodeURIComponent(o.title + " at " + o.org);
            });
          });
        }
      });
    }, 220);
  };

  function field(id, label, control, hint) {
    return '<div class="field"><label class="field__label" for="' + id + '">' + esc(label) + "</label>" + control +
      (hint ? '<p class="field__hint">' + esc(hint) + "</p>" : "") + "</div>";
  }
  C.field = field;

  /* ---------- Resource detail ---------- */
  A.viewResource = function (r) {
    var author = api.profiles.peek(r.author);
    ui.modal.open({
      title: r.title,
      subtitle: u.lookup("resourceTypes", r.type) + " · " + r.subject,
      size: "lg",
      body:
        '<div class="detail">' +
          '<div class="detail__facts">' +
            fact("layers", "Type", u.lookup("resourceTypes", r.type)) +
            fact("graduation", "Department", u.lookup("departments", r.department)) +
            fact("file", "Format", r.format + (r.size && r.size !== "—" ? " · " + r.size : "") + (r.pages ? " · " + r.pages + " pages" : "")) +
            fact("download", "Downloads", u.formatNumber(r.downloads)) +
          "</div>" +
          "<h3>Description</h3><p>" + esc(r.description) + "</p>" +
          (author ? "<h3>Shared by</h3>" + '<a class="person-row person-row--link" href="profile.html?id=' + author.id + '">' + ui.avatar(author, "md") + "<div><strong>" + esc(author.name) + "</strong> " + ui.verificationBadge(author.verification, true) + "<span>" + esc(author.headline) + "</span></div>" + icon("chevron-right") + "</a>" : "") +
          '<p class="notice notice--info">' + icon("info") + "<span><strong>Open</strong> goes to the public source. <strong>Download</strong> saves a demo summary file. File hosting comes in Phase 2.</span></p>" +
        "</div>",
      footer:
        '<button type="button" class="btn btn--ghost" data-share>' + icon("share") + "Share</button>" +
        '<button type="button" class="btn btn--outline" data-download>' + icon("download") + "Download</button>" +
        '<a class="btn btn--primary" href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' + icon("external") + "Open resource</a>",
      onOpen: function (el) {
        el.querySelector("[data-share]").addEventListener("click", function () { share(r.title, "resources.html?id=" + r.id); });
        el.querySelector("[data-download]").addEventListener("click", function () { A.downloadResource(r); });
      }
    });
  };

  A.downloadResource = function (r) {
    var author = api.profiles.peek(r.author);
    var text = [
      "CAMPUS CONNECT — RESOURCE SUMMARY (Demo download)",
      "=================================================",
      "",
      "Title      : " + r.title,
      "Type       : " + u.lookup("resourceTypes", r.type),
      "Subject    : " + r.subject,
      "Department : " + u.lookup("departments", r.department),
      "Format     : " + r.format,
      "Shared by  : " + (author ? author.name : "—"),
      "Source     : " + r.url,
      "",
      r.description,
      "",
      "Note: In Phase 2 the original file will be served from cloud storage."
    ].join("\n");
    u.downloadFile(r.title.replace(/[^\w]+/g, "-").toLowerCase() + ".txt", text);
    ui.toast("Download started.");
  };

  /* ---------- Event detail ---------- */
  A.viewEvent = function (e) {
    var speakers = (e.speakers || []).map(api.profiles.peek).filter(Boolean);
    var pct = Math.min(100, Math.round((e.registered / e.seats) * 100));
    ui.modal.open({
      title: e.title,
      subtitle: u.lookup("eventTypes", e.type) + " · by " + e.organizer,
      size: "lg",
      body:
        '<div class="detail">' +
          '<div class="detail__facts">' +
            fact("calendar", "Date", u.formatDate(e.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })) +
            fact("clock", "Time", e.time) +
            fact("pin", "Venue", e.venue) +
            fact("globe", "Mode", cap(e.mode)) +
          "</div>" +
          "<h3>About this event</h3><p>" + esc(e.description) + "</p>" +
          ui.chips(e.tags) +
          '<div class="seats seats--lg"><div class="seats__bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + e.seats + '" aria-valuenow="' + e.registered + '" aria-label="Seats filled"><span style="width:' + pct + '%"></span></div>' +
            "<small>" + u.formatNumber(e.registered) + " of " + u.formatNumber(e.seats) + " seats filled (" + pct + "%)</small></div>" +
          (speakers.length ? "<h3>Speakers & hosts</h3><div class=\"stack\">" + speakers.map(function (s) {
            return '<a class="person-row person-row--link" href="profile.html?id=' + s.id + '">' + ui.avatar(s, "md") + "<div><strong>" + esc(s.name) + "</strong> " + ui.verificationBadge(s.verification, true) + "<span>" + esc(s.headline) + "</span></div>" + icon("chevron-right") + "</a>";
          }).join("") + "</div>" : "") +
        "</div>",
      footer:
        '<button type="button" class="btn btn--ghost" data-share>' + icon("share") + "Share</button>" +
        (eventState(e) !== "past" ? '<button type="button" class="btn btn--outline" data-ics>' + icon("calendar") + "Add to calendar</button>" : "") +
        C.eventRegisterButton(e),
      onOpen: function (el) {
        el.querySelector("[data-share]").addEventListener("click", function () { share(e.title, "events.html?id=" + e.id); });
        var ics = el.querySelector("[data-ics]");
        if (ics) ics.addEventListener("click", function () { A.addToCalendar(e); });
      }
    });
  };

  A.addToCalendar = function (e) {
    var ymd = e.date.replace(/-/g, "");
    var times = (e.time.match(/\d{1,2}:\d{2}/g) || []).map(function (t) { var p = t.split(":"); return String(p[0]).padStart(2, "0") + p[1] + "00"; });
    var start, end;
    if (times.length) {
      start = "DTSTART:" + ymd + "T" + times[0];
      var endTime = times[1] || String(Math.min(23, +times[0].slice(0, 2) + 2)).padStart(2, "0") + times[0].slice(2);
      end = "DTEND:" + ymd + "T" + endTime;
    } else {
      var next = u.parseDate(e.date); next.setDate(next.getDate() + 1);
      start = "DTSTART;VALUE=DATE:" + ymd;
      end = "DTEND;VALUE=DATE:" + next.getFullYear() + String(next.getMonth() + 1).padStart(2, "0") + String(next.getDate()).padStart(2, "0");
    }
    var ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Campus Connect//Events//EN", "BEGIN:VEVENT",
      "UID:" + e.id + "@campusconnect.demo",
      "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
      start, end,
      "SUMMARY:" + e.title,
      "LOCATION:" + e.venue,
      "DESCRIPTION:" + e.description.replace(/\n/g, " "),
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    u.downloadFile(e.id + "-" + e.title.replace(/[^\w]+/g, "-").toLowerCase() + ".ics", ics, "text/calendar");
    ui.toast("Calendar file downloaded.");
  };

  /* ---------- Event registration (demo) ---------- */
  A.registerEvent = function (e) {
    ui.modal.closeAll();
    var user = currentUser();
    setTimeout(function () {
      ui.modal.open({
        title: "Register: " + e.title,
        subtitle: u.formatDate(e.date, { weekday: "short", day: "numeric", month: "short" }) + " · " + e.time + " · " + e.venue,
        body:
          '<form id="event-form" class="form" novalidate>' +
            '<div class="form-grid">' +
              field("ev-name", "Full name", '<input id="ev-name" name="name" required minlength="3" autocomplete="name" value="' + esc(user.name || "") + '">') +
              field("ev-email", "Email", '<input id="ev-email" type="email" name="email" required autocomplete="email" value="' + esc(user.email || "") + '">') +
              field("ev-phone", "Phone", '<input id="ev-phone" type="tel" name="phone" required inputmode="tel" pattern="[0-9+\\s\\-]{10,15}" title="Enter a valid phone number (10–15 digits)" autocomplete="tel">') +
              field("ev-dept", "Department", '<select id="ev-dept" name="department" required><option value="">Select</option>' + CC.api.meta().departments.map(function (d) { return '<option value="' + d.code + '"' + (user.department === d.code ? " selected" : "") + ">" + esc(d.name) + "</option>"; }).join("") + "</select>") +
            "</div>" +
            (e.mode !== "offline" ? '<fieldset class="field"><legend class="field__label">How will you attend?</legend><div class="choice-chips"><label class="choice-chip"><input type="radio" name="attend" value="In person"' + (e.mode === "hybrid" ? " checked" : "") + '><span>In person</span></label><label class="choice-chip"><input type="radio" name="attend" value="Online"' + (e.mode === "online" ? " checked" : "") + "><span>Online</span></label></div></fieldset>" : "") +
            field("ev-q", "Any question for the speakers?", '<textarea id="ev-q" name="question" rows="3" maxlength="300" placeholder="Optional"></textarea>') +
            '<div class="field field--check"><label class="check"><input type="checkbox" name="consent" required><span>I agree to follow the event guidelines and code of conduct.</span></label></div>' +
          "</form>",
        footer: '<button type="button" class="btn btn--ghost" data-close>Cancel</button><button type="submit" form="event-form" class="btn btn--primary">' + icon("ticket") + "Confirm registration</button>",
        onOpen: function (el) {
          var form = CC.forms.enhance(el.querySelector("#event-form"));
          form.addEventListener("submit", function (ev) {
            ev.preventDefault();
            if (!CC.forms.validate(form)) return;
            ui.setLoading(el.querySelector("button[type=submit]"), true, "Registering…");
            ui.fakeRequest(900).then(function () {
              CC.activity.addTo("eventRegs", e.id);
              window.location.href = "thank-you.html?type=event&ref=" + encodeURIComponent(e.title) + "&id=" + e.id;
            });
          });
        }
      });
    }, 220);
  };

  /* ================================================================
   * Global delegated click handler for [data-action]
   * ============================================================== */
  var handlers = {
    "connect": ["profiles", A.connect],
    "message": ["profiles", A.message],
    "call": ["profiles", A.call],
    "view-opportunity": ["opportunities", A.viewOpportunity],
    "apply": ["opportunities", A.apply],
    "view-resource": ["resources", A.viewResource],
    "download-resource": ["resources", A.downloadResource],
    "view-event": ["events", A.viewEvent],
    "register-event": ["events", A.registerEvent]
  };

  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-action]");
    if (!el) return;
    var action = el.getAttribute("data-action");
    var id = el.getAttribute("data-id");

    if (action === "save") {
      e.preventDefault();
      var kind = el.getAttribute("data-kind");
      var now = CC.activity.toggleSaved(kind, id);
      el.classList.toggle("is-active", now);
      el.setAttribute("aria-pressed", String(now));
      ui.toast(now ? "Saved. Find it later in My Profile." : "Removed from saved.", { type: now ? "success" : "info" });
      emit("cc:saved", { kind: kind, id: id });
      return;
    }

    var h = handlers[action];
    if (!h) return;
    e.preventDefault();
    var item = api[h[0]].peek(id);
    if (item) h[1](item);
  });

  /* ================================================================
   * Tag input (skills) — keyboard friendly, with suggestions
   * Mirrors values into a hidden <input> so forms can validate/serialise.
   * ============================================================== */
  C.tagInput = function (root, o) {
    o = o || {};
    var values = (o.values || []).slice();
    var max = o.max || 12;
    root.innerHTML =
      '<div class="tag-input" data-tags></div>' +
      '<input type="text" class="sr-only" tabindex="-1" aria-hidden="true" name="' + esc(o.name || "skills") + '" ' + (o.required ? "required" : "") + ' data-error="Add at least one skill.">' +
      (o.suggestions ? '<div class="suggestions" aria-label="Suggested skills"></div>' : "");
    var box = root.querySelector("[data-tags]");
    var hidden = root.querySelector('input[name="' + (o.name || "skills") + '"]');
    var sugg = root.querySelector(".suggestions");

    function render(silent) {
      box.innerHTML = values.map(function (v, i) {
        return '<span class="chip chip--removable">' + esc(v) + '<button type="button" data-i="' + i + '" aria-label="Remove ' + esc(v) + '">' + icon("x") + "</button></span>";
      }).join("") + '<input type="text" id="' + esc(o.id || "tag-input") + '" placeholder="' + (values.length ? "Add more…" : esc(o.placeholder || "Type a skill and press Enter")) + '" autocomplete="off" aria-describedby="' + esc(o.id || "tag-input") + '-hint">';
      hidden.value = values.join(", ");
      renderSuggestions("");
      if (o.onChange && !silent) o.onChange(values.slice());
    }
    /** Suggestions narrow down as the user types. */
    function renderSuggestions(query) {
      if (!sugg) return;
      var q = String(query || "").trim().toLowerCase();
      sugg.innerHTML = o.suggestions.filter(function (s) {
        return values.indexOf(s) === -1 && (!q || s.toLowerCase().indexOf(q) > -1);
      }).slice(0, 10).map(function (s) {
        return '<button type="button" class="chip chip--btn" data-add="' + esc(s) + '">+ ' + esc(s) + "</button>";
      }).join("");
    }
    function add(v) {
      v = String(v || "").trim().replace(/,$/, "");
      if (!v || values.length >= max) return;
      if (values.some(function (x) { return x.toLowerCase() === v.toLowerCase(); })) return;
      values.push(v);
      render();
      var inp = box.querySelector("input"); if (inp) inp.focus();
      var wrap = root.closest(".field");
      if (wrap && wrap.classList.contains("has-error")) CC.forms.validateField(hidden);
    }
    box.addEventListener("keydown", function (e) {
      if (e.target.tagName !== "INPUT") return;
      if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(e.target.value); }
      else if (e.key === "Backspace" && !e.target.value && values.length) { values.pop(); render(); box.querySelector("input").focus(); }
    });
    box.addEventListener("input", function (e) { if (e.target.tagName === "INPUT") renderSuggestions(e.target.value); });
    box.addEventListener("focusout", function (e) {
      // Commit typed text on blur, unless the user is clicking a suggestion.
      if (e.relatedTarget && e.relatedTarget.hasAttribute("data-add")) return;
      if (e.target.tagName === "INPUT" && e.target.value.trim()) add(e.target.value);
    });
    box.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-i]");
      if (b) { values.splice(+b.getAttribute("data-i"), 1); render(); box.querySelector("input").focus(); return; }
      if (e.target === box) box.querySelector("input").focus();
    });
    if (sugg) sugg.addEventListener("click", function (e) { var b = e.target.closest("[data-add]"); if (b) add(b.getAttribute("data-add")); });
    render(true);
    return { values: function () { return values.slice(); }, set: function (v) { values = v.slice(); render(true); } };
  };

  /* ================================================================
   * Photo picker: preview, upload/change and remove a profile photo.
   * The image is resized in the browser (see utils.imageToDataUrl).
   * ============================================================== */
  C.photoPicker = function (root, o) {
    o = o || {};
    var value = o.value || "";
    var id = o.id || "photo-input";
    function render() {
      root.innerHTML =
        '<div class="photo-picker">' +
          ui.avatar({ id: "preview", name: o.name || "", photo: value }, "lg") +
          '<div class="photo-picker__actions"><div class="btn-row">' +
            '<label class="btn btn--outline btn--sm file-btn">' + icon("upload") + (value ? "Change photo" : "Upload photo") +
              '<input type="file" id="' + esc(id) + '" accept="image/jpeg,image/png,image/webp" aria-label="Upload profile photo"></label>' +
            (value ? '<button type="button" class="btn btn--ghost btn--sm" data-remove-photo>Remove</button>' : "") +
          '</div><p class="field__hint">JPG, PNG or WEBP · max 5 MB · square photos look best</p></div>' +
        "</div>";
      root.querySelector("input[type=file]").addEventListener("change", function (e) {
        var file = e.target.files[0];
        if (!file) return;
        u.imageToDataUrl(file).then(function (dataUrl) {
          value = dataUrl;
          render();
          if (o.onChange) o.onChange(value);
        }, function (err) { ui.toast(err.message, { type: "error" }); });
      });
      var rm = root.querySelector("[data-remove-photo]");
      if (rm) rm.addEventListener("click", function () { value = ""; render(); if (o.onChange) o.onChange(value); });
    }
    render();
    return { value: function () { return value; } };
  };

  /** All distinct skills in the sample data — used for suggestions. */
  C.allSkills = function () {
    var out = [];
    (window.CC_DATA.profiles || []).forEach(function (p) { p.skills.forEach(function (s) { if (out.indexOf(s) === -1) out.push(s); }); });
    return out.sort(function (a, b) { return a.localeCompare(b); });
  };

  /* ================================================================
   * Listing page helpers (filter sheet + active filter chips)
   * ============================================================== */
  CC.listingUI = {
    /** Mobile bottom-sheet for filters. Desktop shows filters as a sidebar. */
    sheet: function (sheet, toggle) {
      if (!sheet || !toggle) return;
      function set(open) {
        sheet.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        document.body.classList.toggle("no-scroll", open);
        if (open) { var f = sheet.querySelector("input, select, button"); if (f) f.focus({ preventScroll: true }); }
      }
      toggle.addEventListener("click", function () { set(true); });
      u.$$("[data-sheet-close]", sheet).forEach(function (b) { b.addEventListener("click", function () { set(false); toggle.focus(); }); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && sheet.classList.contains("is-open")) set(false); });
      window.addEventListener("resize", u.debounce(function () { if (window.innerWidth >= 1024) set(false); }, 150));
    },

    /**
     * Render removable chips for active filters.
     * @param {HTMLElement} el      container
     * @param {Object} state        listing state
     * @param {Object} labels      { fieldName: value => label }
     * @param {Object} listing      listing controller (uses .set)
     * @returns {number} count of active filters
     */
    activeChips: function (el, state, labels, listing) {
      var chips = [];
      Object.keys(labels).forEach(function (name) {
        var val = state[name];
        [].concat(val || []).forEach(function (v) {
          if (!v) return;
          chips.push({ name: name, value: v, label: labels[name](v) });
        });
      });
      el.innerHTML = chips.map(function (c) {
        return '<span class="chip chip--removable">' + esc(c.label) +
          '<button type="button" data-name="' + esc(c.name) + '" data-value="' + esc(c.value) + '" aria-label="Remove filter ' + esc(c.label) + '">' + icon("x") + "</button></span>";
      }).join("");
      u.$$("button", el).forEach(function (b) {
        b.addEventListener("click", function () {
          var name = b.getAttribute("data-name"), value = b.getAttribute("data-value");
          var cur = listing.state()[name];
          var patch = {};
          patch[name] = Array.isArray(cur) ? cur.filter(function (x) { return x !== value; }) : "";
          listing.set(patch);
        });
      });
      return chips.length;
    },

    options: function (list, selectedValue) {
      return list.map(function (o) {
        var v = typeof o === "object" ? o.code : o, l = typeof o === "object" ? o.name : o;
        return '<option value="' + esc(v) + '"' + (String(v) === String(selectedValue) ? " selected" : "") + ">" + esc(l) + "</option>";
      }).join("");
    }
  };

  /** Open a detail modal if the URL has ?id=… (deep links from share / home page). */
  CC.actions.openFromUrl = function (collectionName, fn) {
    var id = u.getParam("id");
    if (!id) return;
    var item = api[collectionName].peek(id);
    if (item) fn(item);
    else ui.toast("That item could not be found. It may have been removed.", { type: "warning" });
  };
})();
