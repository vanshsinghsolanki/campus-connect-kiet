/**
 * Verification (demo)
 * Sign Up → Choose Verification Method → Upload / Enter Information → Submit → Demo Status Result
 * Files are previewed locally and NEVER uploaded. Admin review is simulated (Phase 2).
 */
CC.page("verify", function () {
  "use strict";
  var u = CC.utils, ui = CC.ui, esc = u.escapeHtml, icon = CC.icon, field = CC.components.field;
  var root = u.$("#verify-root");
  var ORDER = ["method", "details", "review", "status"];
  var MAX_MB = 5;

  var METHODS = {
    email: { title: "College email", icon: "mail", desc: "Instant. We'll send a one-time code to your college email.", time: "Instant" },
    idcard: { title: "Student / Alumni ID card", icon: "idcard", desc: "Upload a clear photo of your college ID card.", time: "24–48 hours" },
    document: { title: "Degree / Provisional certificate", icon: "file", desc: "Best for alumni. Upload your degree or provisional certificate.", time: "2–3 days" }
  };

  var user = CC.auth.current();
  var state = { step: "method", method: "email", details: {}, files: {} };

  function setStep(step) {
    state.step = step;
    var idx = ORDER.indexOf(step);
    u.$$("[data-step-indicator]").forEach(function (li) {
      var i = ORDER.indexOf(li.getAttribute("data-step-indicator"));
      li.classList.toggle("is-active", i === idx);
      li.classList.toggle("is-done", i < idx);
    });
    ({ method: renderMethod, details: renderDetails, review: renderReview, status: renderStatus })[step]();
    var h = root.querySelector("h2");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  }

  /* ---------------- Step 1: Method ---------------- */
  function renderMethod() {
    root.innerHTML =
      (!user ? '<p class="notice notice--warning mb-3">' + icon("alert") + '<span>You are not logged in. <a href="register.html">Create an account</a> first for the full flow. You can still try the verification demo.</span></p>' : "") +
      '<h2>Choose a verification method</h2><p class="mb-3">Pick the option that works best for you.</p>' +
      '<form id="method-form" class="form"><fieldset class="field"><legend class="sr-only">Verification method</legend><div class="option-cards">' +
        Object.keys(METHODS).map(function (k) {
          var m = METHODS[k];
          return '<label class="option-card"><input type="radio" name="method" value="' + k + '"' + (state.method === k ? " checked" : "") + ">" +
            '<span style="grid-template-columns:auto 1fr auto;align-items:center;column-gap:14px">' + icon(m.icon) +
            "<span><strong>" + esc(m.title) + "</strong><br><small>" + esc(m.desc) + "</small></span>" +
            '<span class="badge badge--muted">' + esc(m.time) + "</span></span></label>";
        }).join("") +
      "</div></fieldset>" +
      '<div class="wizard-nav"><button type="submit" class="btn btn--primary">Continue →</button></div></form>';
    u.$$(".option-card > span > .icon", root).forEach(function (i) { i.style.marginBottom = "0"; });
    u.$("#method-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var m = e.target.querySelector("input:checked").value;
      if (m !== state.method) { state.details = {}; state.files = {}; }
      state.method = m;
      setStep("details");
    });
  }

  /* ---------------- Step 2: Details ---------------- */
  function dropzone(name, label, required) {
    var f = state.files[name];
    return '<div class="field" data-dz="' + name + '"><span class="field__label">' + esc(label) + (required ? "" : ' <span class="optional">(optional)</span>') + "</span>" +
      (f ? filePreview(name, f) :
        '<label class="dropzone">' + icon("upload") +
          "<strong>Drop a file here or <span style=\"color:var(--primary-text)\">browse</span></strong>" +
          "<small>JPG, PNG or PDF · max " + MAX_MB + " MB</small>" +
          '<input type="file" name="' + name + '" accept="image/jpeg,image/png,image/webp,application/pdf" data-validate="file"' + (required ? " required" : "") + ' aria-label="' + esc(label) + '">' +
        "</label>") +
      "</div>";
  }
  function filePreview(name, f) {
    var isImg = /^image\//.test(f.type);
    return '<div class="file-preview">' +
      (isImg ? '<img src="' + f.url + '" alt="Preview of ' + esc(f.name) + '">' : '<span class="type-tile type-tile--paper">' + icon("file") + "</span>") +
      "<div><strong>" + esc(f.name) + "</strong><span>" + (f.size / 1024 / 1024).toFixed(2) + " MB · ready (stays on your device)</span></div>" +
      '<button type="button" class="icon-btn" data-remove="' + name + '" aria-label="Remove file">' + icon("x") + "</button></div>" +
      '<input type="hidden" name="' + name + '" value="' + esc(f.name) + '">';
  }

  function bindDropzones(form) {
    u.$$("[data-dz]", form).forEach(bindDropzone);
  }
  function bindDropzone(wrap) {
    (function () {
      var name = wrap.getAttribute("data-dz");
      var input = wrap.querySelector('input[type="file"]');
      var zone = wrap.querySelector(".dropzone");
      if (zone) {
        ["dragenter", "dragover"].forEach(function (ev) { zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add("is-drag"); }); });
        ["dragleave", "drop"].forEach(function (ev) { zone.addEventListener(ev, function () { zone.classList.remove("is-drag"); }); });
        zone.addEventListener("drop", function (e) {
          e.preventDefault();
          if (e.dataTransfer.files[0]) accept(name, e.dataTransfer.files[0], wrap);
        });
      }
      if (input) input.addEventListener("change", function () { if (input.files[0]) accept(name, input.files[0], wrap); });
      var rm = wrap.querySelector("[data-remove]");
      if (rm) rm.addEventListener("click", function () {
        if (state.files[name] && state.files[name].url) URL.revokeObjectURL(state.files[name].url);
        delete state.files[name];
        rerenderDropzone(wrap, name);
      });
    })();
  }
  function accept(name, file, wrap) {
    var okType = /^(image\/(jpeg|png|webp)|application\/pdf)$/.test(file.type);
    if (!okType) return ui.toast("Please choose a JPG, PNG, WEBP or PDF file.", { type: "error" });
    if (file.size > MAX_MB * 1024 * 1024) return ui.toast("File is larger than " + MAX_MB + " MB.", { type: "error" });
    state.files[name] = { name: file.name, size: file.size, type: file.type, url: /^image\//.test(file.type) ? URL.createObjectURL(file) : "" };
    rerenderDropzone(wrap, name);
  }
  function rerenderDropzone(wrap, name) {
    var required = wrap.innerHTML.indexOf("optional") === -1;
    var label = wrap.querySelector(".field__label").childNodes[0].textContent.trim();
    var tmp = document.createElement("div");
    tmp.innerHTML = dropzone(name, label, required);
    var fresh = tmp.firstChild;
    wrap.replaceWith(fresh);
    bindDropzone(fresh);
  }

  function renderDetails() {
    var m = state.method, d = state.details;
    var body = "";
    if (m === "email") {
      body =
        field("v-email", "College email address",
          '<div class="input-action"><input id="v-email" name="collegeEmail" type="email" required value="' + esc(d.collegeEmail || (user && /\.(edu|ac\.in|edu\.in)$/.test(user.email) ? user.email : "")) + '" placeholder="name@kiet.edu" pattern=".+@.+\\.(edu|ac\\.in|edu\\.in)$" title="Use your college email ending in .edu, .ac.in or .edu.in">' +
          "</div>", "Must end with .edu, .ac.in or .edu.in") +
        '<div class="btn-row"><button type="button" class="btn btn--outline" id="send-otp">' + icon("send") + "Send code</button><span class=\"text-sm muted\" id=\"otp-timer\"></span></div>" +
        '<div class="field' + (d.otpSent ? "" : " hidden") + '" id="otp-field"><span class="field__label" id="otp-label">Enter the 6-digit code</span>' +
          '<div class="otp" role="group" aria-labelledby="otp-label">' +
            [0, 1, 2, 3, 4, 5].map(function (i) { return '<input type="text" inputmode="numeric" maxlength="1" pattern="[0-9]" aria-label="Digit ' + (i + 1) + '" data-otp="' + i + '" autocomplete="' + (i === 0 ? "one-time-code" : "off") + '">'; }).join("") +
          "</div><p class=\"field__hint\">Demo code: <strong>" + CC.config.demoOtp + "</strong> (in Phase 2 it will be emailed to you)</p></div>";
    } else if (m === "idcard") {
      body =
        '<div class="form-grid">' +
          field("v-enrol", "Enrollment / Roll number", '<input id="v-enrol" name="enrollment" required pattern="[A-Za-z0-9\\/\\-]{5,20}" title="5–20 letters or numbers" value="' + esc(d.enrollment || "") + '" placeholder="e.g. 21CSE1042">') +
          field("v-idname", "Name on ID card", '<input id="v-idname" name="idName" required minlength="3" value="' + esc(d.idName || (user ? user.name : "")) + '">') +
        "</div>" +
        dropzone("idFront", "ID card: front side", true) +
        dropzone("idBack", "ID card: back side", false);
    } else {
      var years = []; for (var y = new Date().getFullYear(); y >= 2005; y--) years.push(y);
      body =
        '<div class="form-grid">' +
          field("v-roll", "University roll number", '<input id="v-roll" name="roll" required pattern="[A-Za-z0-9\\/\\-]{5,20}" title="5–20 letters or numbers" value="' + esc(d.roll || "") + '">') +
          field("v-year", "Year of graduation", '<select id="v-year" name="gradYear" required><option value="">Select</option>' + CC.listingUI.options(years, d.gradYear || (user && user.batch)) + "</select>") +
        "</div>" +
        dropzone("certificate", "Degree / provisional certificate", true);
    }

    root.innerHTML =
      "<h2>" + esc(METHODS[m].title) + '</h2><p class="mb-3">' + esc(METHODS[m].desc) + "</p>" +
      '<form id="details-form" class="form" novalidate>' + body +
        '<p class="notice notice--info">' + icon("lock") + "<span>Demo: documents are previewed only in your browser and are never uploaded. Secure storage (Firebase Storage) is planned for Phase 2.</span></p>" +
        '<div class="wizard-nav"><button type="button" class="btn btn--ghost" data-back>← Back</button><button type="submit" class="btn btn--primary">Continue →</button></div>' +
      "</form>";

    var form = CC.forms.enhance(u.$("#details-form"));
    u.$("[data-back]", root).addEventListener("click", function () { setStep("method"); });
    bindDropzones(form);
    if (m === "email") bindOtp(form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!CC.forms.validate(form)) return;
      // File inputs are validated manually (they may be replaced by previews)
      var missing = u.$$("[data-dz]", form).filter(function (w) {
        return w.innerHTML.indexOf("optional") === -1 && !state.files[w.getAttribute("data-dz")];
      });
      if (missing.length) { ui.toast("Please upload the required document.", { type: "error" }); return; }
      if (m === "email") {
        var code = u.$$("[data-otp]", form).map(function (i) { return i.value; }).join("");
        if (!state.details.otpSent) { ui.toast("Send the verification code first.", { type: "error" }); return; }
        if (code !== CC.config.demoOtp) { ui.toast("Incorrect code. Try " + CC.config.demoOtp + " (demo).", { type: "error" }); u.$("[data-otp]", form).focus(); return; }
      }
      Object.assign(state.details, CC.forms.serialize(form));
      setStep("review");
    });
  }

  var timer;
  function bindOtp(form) {
    var send = u.$("#send-otp", form);
    var otpField = u.$("#otp-field", form);
    var inputs = u.$$("[data-otp]", form);
    send.addEventListener("click", function () {
      var email = u.$("#v-email", form);
      if (!CC.forms.validateField(email)) { email.focus(); return; }
      ui.setLoading(send, true, "Sending…");
      ui.fakeRequest(700).then(function () {
        ui.setLoading(send, false);
        state.details.otpSent = true;
        state.details.collegeEmail = email.value;
        otpField.classList.remove("hidden");
        inputs[0].focus();
        ui.toast("Code sent to " + email.value + ". Demo code: " + CC.config.demoOtp, { type: "info", timeout: 7000 });
        var left = 30;
        send.disabled = true;
        clearInterval(timer);
        timer = setInterval(function () {
          left--;
          var t = u.$("#otp-timer"); if (t) t.textContent = left > 0 ? "Resend in " + left + "s" : "";
          if (left <= 0) { clearInterval(timer); send.disabled = false; send.innerHTML = icon("send") + "Resend code"; }
        }, 1000);
      });
    });
    inputs.forEach(function (inp, i) {
      inp.addEventListener("input", function () {
        inp.value = inp.value.replace(/\D/g, "").slice(0, 1);
        if (inp.value && inputs[i + 1]) inputs[i + 1].focus();
      });
      inp.addEventListener("keydown", function (e) {
        if (e.key === "Backspace" && !inp.value && inputs[i - 1]) inputs[i - 1].focus();
        if (e.key === "ArrowLeft" && inputs[i - 1]) inputs[i - 1].focus();
        if (e.key === "ArrowRight" && inputs[i + 1]) inputs[i + 1].focus();
      });
      inp.addEventListener("paste", function (e) {
        var text = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "").slice(0, 6);
        if (!text) return;
        e.preventDefault();
        text.split("").forEach(function (c, j) { if (inputs[j]) inputs[j].value = c; });
        (inputs[text.length] || inputs[5]).focus();
      });
    });
  }

  /* ---------------- Step 3: Review & submit ---------------- */
  function renderReview() {
    var d = state.details, m = state.method;
    var rows = [["Method", METHODS[m].title], ["Expected time", METHODS[m].time]];
    if (m === "email") rows.push(["College email", d.collegeEmail], ["Code", "Verified ✓"]);
    if (m === "idcard") rows.push(["Enrollment no.", d.enrollment], ["Name on ID", d.idName], ["Front side", state.files.idFront && state.files.idFront.name], ["Back side", state.files.idBack ? state.files.idBack.name : "—"]);
    if (m === "document") rows.push(["Roll number", d.roll], ["Graduation year", d.gradYear], ["Certificate", state.files.certificate && state.files.certificate.name]);

    root.innerHTML =
      '<h2>Review & submit</h2><p class="mb-3">Please confirm your details before submitting.</p>' +
      '<dl class="review-list">' + rows.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1] || "—") + "</dd></div>"; }).join("") + "</dl>" +
      '<form id="submit-form" class="form mt-3" novalidate>' +
        '<div class="field field--check"><label class="check"><input type="checkbox" name="confirm" required><span>I confirm these details are genuine. False information may lead to account suspension.</span></label></div>' +
        '<div class="wizard-nav"><button type="button" class="btn btn--ghost" data-back>← Back</button><button type="submit" class="btn btn--primary">' + icon("shield") + "Submit for verification</button></div>" +
      "</form>";
    var form = CC.forms.enhance(u.$("#submit-form"));
    u.$("[data-back]", root).addEventListener("click", function () { setStep("details"); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!CC.forms.validate(form)) return;
      ui.setLoading(u.$("button[type=submit]", form), true, "Submitting…");
      ui.fakeRequest(1100).then(function () {
        var status = m === "email" ? "verified" : "pending";
        save({ method: m, status: status, submittedAt: Date.now(), reference: "CC-" + Math.random().toString(36).slice(2, 8).toUpperCase() });
        ui.toast(status === "verified" ? "You're verified! 🎉" : "Submitted for review.", { type: "success" });
        setStep("status");
      });
    });
  }

  function save(v) {
    CC.store.set("verification", v);
    if (CC.auth.user()) CC.auth.saveUser({ verification: v ? v.status : "unverified" });
  }

  /* ---------------- Step 4: Status ---------------- */
  function renderStatus() {
    var v = CC.store.get("verification", null);
    if (!v) return setStep("method");
    var m = METHODS[v.method] || METHODS.email;
    var verified = v.status === "verified", rejected = v.status === "rejected";

    var steps = [
      { title: "Submitted", text: "Received " + new Date(v.submittedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }), state: "is-done", icon: "check" },
      { title: "Under review", text: verified ? "Checks completed" : rejected ? "Review completed" : "Expected within " + m.time, state: verified || rejected ? "is-done" : "is-current", icon: verified || rejected ? "check" : "hourglass" },
      { title: rejected ? "Not approved" : "Verified", text: verified ? "Verified badge added to your profile" : rejected ? "The document was unclear. Please try again." : "Pending", state: verified ? "is-done" : "", icon: rejected ? "x" : "verified" }
    ];

    root.innerHTML =
      '<div class="center" style="display:grid;justify-items:center;gap:8px">' +
        '<div class="status-page__icon' + (verified ? "" : " status-page__icon--primary") + '" style="width:80px;height:80px">' + icon(verified ? "verified" : rejected ? "alert" : "hourglass") + "</div>" +
        "<h2>" + (verified ? "You're verified!" : rejected ? "Verification not approved" : "Verification in review") + "</h2>" +
        "<p>" + (verified ? "Your profile now shows a verified badge. Seniors and alumni can trust who they're talking to."
          : rejected ? "Don't worry. You can submit again with a clearer document or use another method."
          : "Thanks! Our campus admin team will review your " + esc(m.title.toLowerCase()) + ". We'll notify you once it's done.") + "</p>" +
        '<div class="badge-row" style="justify-content:center">' + ui.verificationBadge(verified ? "verified" : rejected ? "unverified" : "pending") + '<span class="badge badge--muted">Ref: ' + esc(v.reference || "—") + "</span></div>" +
      "</div>" +
      '<ol class="status-track mt-4">' + steps.map(function (s) {
        return '<li class="' + s.state + '"><span class="status-track__dot">' + icon(s.icon) + "</span><div><strong>" + esc(s.title) + "</strong><span>" + esc(s.text) + "</span></div></li>";
      }).join("") + "</ol>" +
      (!verified && !rejected ? '<div class="notice notice--warning mt-3">' + icon("info") + "<span><strong>Demo controls:</strong> admin review is a Phase 2 feature. Use these buttons to preview each outcome.</span></div>" +
        '<div class="btn-row mt-2"><button type="button" class="btn btn--primary" data-sim="verified">' + icon("check") + 'Simulate approval</button><button type="button" class="btn btn--outline" data-sim="rejected">Simulate rejection</button></div>' : "") +
      '<hr><div class="btn-row">' +
        (verified ? '<a class="btn btn--primary" href="' + (user ? "my-profile.html" : "register.html") + '">' + (user ? "Go to my profile" : "Create your account") + '</a><a class="btn btn--outline" href="people.html">Explore people</a>'
          : '<a class="btn btn--outline" href="people.html">Explore people meanwhile</a>') +
        '<button type="button" class="btn btn--ghost" data-restart>Start over</button>' +
      "</div>";

    u.$$("[data-sim]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        v.status = b.getAttribute("data-sim");
        save(v);
        ui.toast(v.status === "verified" ? "Approved (demo). You're verified! 🎉" : "Rejected (demo).", { type: v.status === "verified" ? "success" : "warning" });
        renderStatus();
      });
    });
    u.$("[data-restart]", root).addEventListener("click", function () {
      ui.confirm({ title: "Start over?", message: "This clears your current verification status (demo).", confirmText: "Start over" }).then(function (ok) {
        if (!ok) return;
        CC.store.remove("verification");
        if (CC.auth.user()) CC.auth.saveUser({ verification: "unverified" });
        state = { step: "method", method: "email", details: {}, files: {} };
        setStep("method");
      });
    });
  }

  setStep(CC.store.get("verification", null) ? "status" : "method");
});
