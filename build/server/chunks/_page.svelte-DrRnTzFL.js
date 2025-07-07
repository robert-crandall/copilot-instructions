import { t as push, x as head, y as bind_props, v as pop } from './index-CQdaRTXO.js';
import './client-BNK_pNP3.js';
import { e as escape_html } from './escaping-CqgfEcN3.js';
import { a as attr } from './attributes-YVTFWYF4.js';
import './exports-CoBaX9l6.js';

function _page($$payload, $$props) {
  push();
  let form = $$props["form"];
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Register - Journal App</title>`;
  });
  $$payload.out += `<div class="min-h-screen bg-base-200 flex items-center justify-center p-4"><div class="card w-full max-w-md bg-base-100 shadow-xl"><div class="card-body"><h1 class="card-title text-2xl font-bold text-center mb-6">Create Account</h1> `;
  if (form?.error) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="alert alert-error mb-4"><span>${escape_html(form.error)}</span></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <form method="POST" class="space-y-4"><div class="form-control"><label for="displayName" class="label"><span class="label-text">Display Name</span></label> <input type="text" id="displayName" name="displayName" class="input input-bordered w-full"${attr("value", form?.displayName ?? "")} required placeholder="Enter your display name"/></div> <div class="form-control"><label for="email" class="label"><span class="label-text">Email</span></label> <input type="email" id="email" name="email" class="input input-bordered w-full"${attr("value", form?.email ?? "")} required placeholder="Enter your email address"/></div> <div class="form-control"><label for="password" class="label"><span class="label-text">Password</span></label> <input type="password" id="password" name="password" class="input input-bordered w-full" required placeholder="Enter your password" minlength="8"/> <div class="label"><span class="label-text-alt">Must be at least 8 characters</span></div></div> <div class="form-control"><label for="confirmPassword" class="label"><span class="label-text">Confirm Password</span></label> <input type="password" id="confirmPassword" name="confirmPassword" class="input input-bordered w-full" required placeholder="Confirm your password" minlength="8"/></div> <div class="form-control mt-6"><button type="submit" class="btn btn-primary w-full">Create Account</button></div></form> <div class="divider">Already have an account?</div> <div class="text-center"><a href="/login" class="link link-primary">Sign in here</a></div></div></div></div>`;
  bind_props($$props, { form });
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DrRnTzFL.js.map
