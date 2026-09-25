/** Coming-soon page: generic placeholder for Phase 2 features (?feature=…) */
CC.page("coming-soon", function () {
  "use strict";
  var u = CC.utils, ui = CC.ui;
  var FEATURES = {
    "password-reset": ["Password reset", "Secure password reset via email arrives with real authentication (Firebase Auth) in Phase 2. For the demo, any password works on the login page."],
    "messaging": ["Real-time messaging", "Chat with your connections in real time. The current messaging window is a front-end demo."],
    "admin": ["Admin dashboard", "Campus admins will review verification requests and moderate content."],
    "notifications": ["Notifications", "Get notified when someone accepts your request, replies, or posts a new opportunity."]
  };
  var f = FEATURES[u.getParam("feature")];
  if (f) {
    u.$("#cs-title").textContent = f[0] + " is coming soon";
    u.$("#cs-text").textContent = f[1];
    document.title = f[0] + " (coming soon) · Campus Connect";
  }

  var form = CC.forms.enhance(u.$("#notify-form"));
  var me = CC.auth.current();
  if (me) u.$("#notify-email").value = me.email;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = u.$("#notify-email");
    if (!CC.forms.validateField(email)) { email.focus(); ui.toast("Please enter a valid email.", { type: "error" }); return; }
    ui.setLoading(u.$("button[type=submit]", form), true, "Saving…");
    ui.fakeRequest(600).then(function () {
      window.location.href = "thank-you.html?type=notify";
    });
  });
});
