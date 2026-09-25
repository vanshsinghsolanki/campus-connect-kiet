/** Login (demo): front-end form only, no real authentication. */
CC.page("login", function () {
  "use strict";
  var u = CC.utils, ui = CC.ui, esc = u.escapeHtml;
  var form = CC.forms.enhance(u.$("#login-form"));

  /** Only allow redirects to local pages (prevents open-redirects). */
  function safeNext() {
    var next = u.getParam("next") || "";
    return /^[\w-]+\.html(\?[\w=&%.-]*)?$/.test(next) ? next : "my-profile.html";
  }

  var current = CC.auth.current();
  if (current) {
    var box = u.$("#already");
    box.classList.remove("hidden");
    box.innerHTML = '<div class="notice notice--success mb-3">' + CC.icon("check") +
      "<span>You're already logged in as <strong>" + esc(current.name) + '</strong>. <a href="my-profile.html">Go to my profile</a></span></div>';
  }

  var user = CC.auth.user();
  if (user && user.email) u.$("#login-email").value = user.email;

  u.$("#fill-demo").addEventListener("click", function () {
    u.$("#login-email").value = (user && user.email) || "demo.student@kiet.edu";
    u.$("#login-password").value = "Demo@1234";
    u.$$("input", form).forEach(CC.forms.validateField);
    u.$("button[type=submit]", form).focus();
  });

  u.$$("[data-phase2]").forEach(function (b) {
    b.addEventListener("click", function () {
      ui.toast(b.getAttribute("data-phase2") + " is coming in Phase 2.", { type: "info" });
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!CC.forms.validate(form)) return;
    var btn = u.$("button[type=submit]", form);
    ui.setLoading(btn, true, "Logging in…");
    ui.fakeRequest(800).then(function () {
      var me = CC.auth.login(u.$("#login-email").value.trim().toLowerCase());
      CC.store.set("flash", { message: "Welcome back, " + me.name.split(" ")[0] + "!", type: "success" });
      window.location.href = safeNext();
    });
  });
});
