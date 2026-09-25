/** Contact form (demo) → thank-you page */
CC.page("contact", function () {
  "use strict";
  var u = CC.utils, ui = CC.ui;
  var form = CC.forms.enhance(u.$("#contact-form"));
  var me = CC.auth.current();
  if (me) { u.$("#c-name").value = me.name; u.$("#c-email").value = me.email; }

  var msg = u.$("#c-message");
  msg.addEventListener("input", function () { u.$("#c-count").textContent = msg.value.length; });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!CC.forms.validate(form)) return;
    ui.setLoading(u.$("button[type=submit]", form), true, "Sending…");
    ui.fakeRequest(900).then(function () { window.location.href = "thank-you.html?type=contact"; });
  });
});
