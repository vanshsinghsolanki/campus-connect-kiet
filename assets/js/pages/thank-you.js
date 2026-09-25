/**
 * Thank-you page: one reusable confirmation page for every flow.
 * Usage: thank-you.html?type=register|application|event|contact|notify&ref=…&name=…&id=…
 */
CC.page("thank-you", function () {
  "use strict";
  var u = CC.utils, esc = u.escapeHtml, icon = CC.icon;
  var type = u.getParam("type") || "default";
  var ref = u.getParam("ref") || "";
  var name = u.getParam("name") || "";
  var eventId = u.getParam("id");

  var VARIANTS = {
    register: {
      title: "Welcome aboard" + (name ? ", " + name : "") + "! 🎉",
      text: "Your Campus Connect profile has been created. Next step: verify your profile to earn a trusted badge.",
      actions: [["verify.html", "Verify my profile", "primary"], ["people.html", "Explore people", "outline"], ["my-profile.html", "View my profile", "ghost"]],
      steps: ["Verify with your college email or ID card", "Complete your profile (bio, skills, links)", "Connect with seniors & alumni"]
    },
    application: {
      title: "Application submitted!",
      text: "Your application" + (ref ? " for " + ref : "") + " was recorded. In the full version, the organiser will be notified and you'll get status updates.",
      actions: [["opportunities.html", "Browse more opportunities", "primary"], ["my-profile.html#activity", "View my applications", "outline"]]
    },
    event: {
      title: "You're registered!",
      text: "See you at " + (ref || "the event") + ". A confirmation would normally be emailed to you.",
      actions: [["events.html", "Browse more events", "outline"], ["my-profile.html#activity", "My registrations", "ghost"]],
      ics: true
    },
    contact: {
      title: "Message received",
      text: "Thanks for reaching out. Our team usually replies within 24–48 hours.",
      actions: [["index.html", "Back to home", "primary"], ["faq.html", "Read the FAQ", "outline"]]
    },
    notify: {
      title: "You're on the list",
      text: "We'll let you know as soon as this feature launches in Phase 2.",
      actions: [["index.html", "Back to home", "primary"], ["about.html", "See the roadmap", "outline"]]
    },
    "default": {
      title: "Thank you!",
      text: "Your submission has been received.",
      actions: [["index.html", "Back to home", "primary"]]
    }
  };

  var v = VARIANTS[type] || VARIANTS["default"];
  document.title = v.title.replace(/[^\w\s!,'-]/g, "").trim() + " · Campus Connect";

  var ev = eventId ? CC.api.events.peek(eventId) : null;

  u.$("#ty-root").innerHTML =
    '<div class="status-page__icon">' + icon("check") + "</div>" +
    "<h1>" + esc(v.title) + "</h1>" +
    "<p>" + esc(v.text) + "</p>" +
    (v.steps ? '<div class="card"><h2 style="font-size:1rem">What to do next</h2><ol class="status-track mt-1">' + v.steps.map(function (s, i) {
      return '<li><span class="status-track__dot">' + (i + 1) + "</span><div><strong>" + esc(s) + "</strong></div></li>";
    }).join("") + "</ol></div>" : "") +
    '<div class="btn-row">' +
      (v.ics && ev ? '<button type="button" class="btn btn--primary" id="add-ics">' + icon("calendar") + "Add to calendar</button>" : "") +
      v.actions.map(function (a) { return '<a class="btn btn--' + a[2] + '" href="' + a[0] + '">' + esc(a[1]) + "</a>"; }).join("") +
    "</div>" +
    '<p class="text-sm muted mt-2">Phase 1 demo: nothing was sent to a server.</p>';

  var ics = u.$("#add-ics");
  if (ics) ics.addEventListener("click", function () { CC.actions.addToCalendar(ev); });
  var h1 = u.$("#ty-root h1");
  if (h1) { h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); }
});
