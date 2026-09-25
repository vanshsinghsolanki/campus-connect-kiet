/** Registration (demo): multi-step wizard with validation and draft autosave. */
CC.page("register", function () {
  "use strict";
  var u = CC.utils, ui = CC.ui, esc = u.escapeHtml;
  var meta = CC.api.meta();
  var form = CC.forms.enhance(u.$("#register-form"));
  var steps = u.$$(".wizard-step", form);
  var total = steps.length;
  var current = 1;
  var DRAFT_KEY = "registerDraft";

  // ---- Populate selects ----
  u.$("#r-dept").insertAdjacentHTML("beforeend", CC.listingUI.options(meta.departments));
  var years = [];
  for (var y = 2031; y >= 2010; y--) years.push(y);
  u.$("#r-batch").insertAdjacentHTML("beforeend", CC.listingUI.options(years));

  var openOptions = ["Mentorship", "Referrals", "Mock Interviews", "Project Collaboration", "Study Groups", "Higher Studies Guidance", "Networking"];
  u.$("#open-to").innerHTML = openOptions.map(function (o, i) {
    return '<label class="choice-chip"><input type="checkbox" name="openTo" value="' + esc(o) + '" data-array' + (i === 0 ? " checked" : "") + "><span>" + esc(o) + "</span></label>";
  }).join("");

  // Profile photo: resized in the browser; kept in memory until submit
  var photo = CC.components.photoPicker(u.$("#photo-picker"), { id: "r-photo" });

  var skills = CC.components.tagInput(u.$("#skills"), {
    id: "skills-input", name: "skills", required: true, suggestions: CC.components.allSkills(), onChange: saveDraft
  });

  // ---- Role-dependent field ----
  function syncRole() {
    var role = (form.querySelector('input[name="role"]:checked') || {}).value;
    u.$("#company-field").classList.toggle("hidden", role !== "alumni");
  }
  form.addEventListener("change", function (e) { if (e.target.name === "role") syncRole(); });

  // ---- Password strength ----
  var pw = u.$("#r-password");
  pw.addEventListener("input", function () {
    var s = CC.forms.passwordScore(pw.value);
    u.$(".pw-meter").setAttribute("data-score", s);
    u.$("#pw-label").textContent = pw.value ? ["Too weak", "Weak", "Fair", "Good", "Strong"][s] + " password" : "8+ characters with a letter and a number.";
  });

  // ---- Draft autosave (never stores passwords) ----
  function saveDraft() {
    var data = CC.forms.serialize(form);
    delete data.password; delete data.confirm;
    delete data.photo; // images are too large for the draft
    data.skills = skills ? skills.values() : [];
    data.step = current;
    CC.store.set(DRAFT_KEY, data);
  }
  function restoreDraft() {
    var d = CC.store.get(DRAFT_KEY, null);
    if (!d || !(d.name || d.email || d.headline)) return;
    ["name", "email", "phone", "department", "batch", "company", "headline", "bio", "linkedin", "github"].forEach(function (k) {
      var el = form.elements[k];
      if (el && d[k]) el.value = d[k];
    });
    if (d.role) { var r = form.querySelector('input[name="role"][value="' + d.role + '"]'); if (r) r.checked = true; }
    if (d.openTo) u.$$('input[name="openTo"]', form).forEach(function (c) { c.checked = [].concat(d.openTo).indexOf(c.value) > -1; });
    if (d.skills && d.skills.length) skills.set(d.skills);
    ui.toast("We restored your unfinished registration.", { type: "info" });
  }
  form.addEventListener("input", u.debounce(saveDraft, 400));
  form.addEventListener("change", saveDraft);

  // ---- Wizard navigation ----
  var prev = u.$("#prev-step"), next = u.$("#next-step"), submit = u.$("#submit-step");

  function go(step, initial) {
    current = Math.max(1, Math.min(total, step));
    steps.forEach(function (s) { s.hidden = +s.getAttribute("data-step") !== current; });
    u.$$("[data-step-indicator]").forEach(function (li) {
      var n = +li.getAttribute("data-step-indicator");
      li.classList.toggle("is-active", n === current);
      li.classList.toggle("is-done", n < current);
      if (n === current) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
    prev.hidden = current === 1;
    next.hidden = current === total;
    submit.hidden = current !== total;
    if (current === total) renderReview();
    var first = steps[current - 1].querySelector("input:not([type=hidden]):not(.sr-only), select, textarea, h2");
    if (initial) return; // never steal focus on page load
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (first && first.focus) first.focus({ preventScroll: true });
  }

  next.addEventListener("click", function () {
    if (!CC.forms.validate(steps[current - 1])) {
      ui.toast("Please fix the highlighted fields.", { type: "error" });
      return;
    }
    go(current + 1);
  });
  prev.addEventListener("click", function () { go(current - 1); });

  function renderReview() {
    var d = CC.forms.serialize(form);
    var rows = [
      ["Name", d.name], ["Email", d.email], ["Phone", d.phone || "—"],
      ["Role", u.lookup("roles", d.role)], ["Department", u.lookup("departments", d.department)], ["Batch", d.batch],
      d.role === "alumni" ? ["Company", d.company || "—"] : null,
      ["Photo", photo.value() ? "Added ✓" : "Not added"],
      ["Headline", d.headline], ["Skills", skills.values().join(", ")],
      ["Open to", [].concat(d.openTo || []).join(", ") || "—"],
      ["LinkedIn", d.linkedin || "—"], ["GitHub", d.github || "—"]
    ].filter(Boolean);
    u.$("#review").innerHTML = rows.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("") +
      '<div><dt>Edit</dt><dd><div class="btn-row"><button type="button" class="btn btn--outline btn--sm" data-goto="1">Account</button><button type="button" class="btn btn--outline btn--sm" data-goto="2">Profile</button><button type="button" class="btn btn--outline btn--sm" data-goto="3">Preferences</button></div></dd></div>';
    u.$$("[data-goto]").forEach(function (b) { b.addEventListener("click", function () { go(+b.getAttribute("data-goto")); }); });
  }

  // ---- Submit ----
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (current !== total) { next.click(); return; }
    for (var i = 0; i < total - 1; i++) {
      if (!CC.forms.validate(steps[i])) { go(i + 1); return; }
    }
    var d = CC.forms.serialize(form);
    ui.setLoading(submit, true, "Creating account…");
    ui.fakeRequest(1000).then(function () {
      CC.store.set("user", null); // start a fresh demo account
      CC.auth.saveUser({
        name: d.name.trim(),
        photo: photo.value(),
        email: d.email.trim().toLowerCase(),
        phone: d.phone || "",
        role: d.role,
        department: d.department,
        batch: +d.batch,
        company: d.role === "alumni" ? d.company || "" : "",
        headline: d.headline.trim(),
        bio: (d.bio || "").trim(),
        skills: skills.values(),
        openTo: [].concat(d.openTo || []),
        links: { linkedin: d.linkedin || "", github: d.github || "" },
        callAvailable: !!d.callAvailable,
        verification: "unverified",
        createdAt: Date.now()
      });
      CC.store.set("session", { email: d.email, at: Date.now() });
      CC.store.remove(DRAFT_KEY);
      window.location.href = "thank-you.html?type=register&name=" + encodeURIComponent(d.name.split(" ")[0]);
    });
  });

  // Enter key on steps 1–3 should advance, not submit
  form.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type !== "checkbox" && !e.target.closest("[data-tags]") && current < total) {
      e.preventDefault();
      next.click();
    }
  });

  restoreDraft();
  syncRole();
  go(1, true);
});
