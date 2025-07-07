import { x as head, y as bind_props, v as pop, t as push } from "../../../chunks/index.js";
import "../../../chunks/client.js";
import { e as escape_html } from "../../../chunks/escaping.js";
import { a as attr } from "../../../chunks/attributes.js";
function _page($$payload, $$props) {
  push();
  let form = $$props["form"];
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Login - Journal App</title>`;
  });
  $$payload.out += `<div class="min-h-screen bg-base-200 flex items-center justify-center p-4"><div class="card w-full max-w-md bg-base-100 shadow-xl"><div class="card-body"><h1 class="card-title text-2xl font-bold text-center mb-6">Sign In</h1> `;
  if (form?.error) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="alert alert-error mb-4"><span>${escape_html(form.error)}</span></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <form method="POST" class="space-y-4"><div class="form-control"><label for="email" class="label"><span class="label-text">Email</span></label> <input type="email" id="email" name="email" class="input input-bordered w-full"${attr("value", form?.email ?? "")} required placeholder="Enter your email address"/></div> <div class="form-control"><label for="password" class="label"><span class="label-text">Password</span></label> <input type="password" id="password" name="password" class="input input-bordered w-full" required placeholder="Enter your password"/></div> <div class="form-control mt-6"><button type="submit" class="btn btn-primary w-full">Sign In</button></div></form> <div class="divider">Need an account?</div> <div class="text-center"><a href="/register" class="link link-primary">Create account here</a></div></div></div></div>`;
  bind_props($$props, { form });
  pop();
}
export {
  _page as default
};
