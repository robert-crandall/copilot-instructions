import { t as push, x as head, y as bind_props, v as pop } from './index-CQdaRTXO.js';
import { e as escape_html } from './escaping-CqgfEcN3.js';

function _page($$payload, $$props) {
  push();
  let data = $$props["data"];
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Dashboard - Journal App</title>`;
  });
  $$payload.out += `<div class="min-h-screen bg-base-200"><div class="navbar bg-base-100 shadow-lg"><div class="flex-1"><a href="/dashboard" class="btn btn-ghost text-xl">Journal App</a></div> <div class="flex-none gap-2"><div class="dropdown dropdown-end"><div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar"><div class="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">${escape_html(data.user.displayName.charAt(0).toUpperCase())}</div></div> <ul class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"><li class="menu-title">${escape_html(data.user.displayName)}</li> <li><a href="/dashboard">Dashboard</a></li> <li><form method="POST" action="/logout"><button type="submit" class="w-full text-left">Logout</button></form></li></ul></div></div></div> <div class="container mx-auto p-6"><div class="hero bg-base-100 rounded-lg shadow-xl"><div class="hero-content text-center"><div class="max-w-md"><h1 class="text-5xl font-bold">Welcome back!</h1> <p class="py-6">Hello, ${escape_html(data.user.displayName)}! You're successfully logged in to your journal app.</p> <div class="stats shadow"><div class="stat"><div class="stat-title">Member since</div> <div class="stat-value text-lg">${escape_html(new Date(data.user.createdAt).toLocaleDateString())}</div></div></div></div></div></div> <div class="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3"><div class="card bg-base-100 shadow-xl"><div class="card-body"><h2 class="card-title">Create Content</h2> <p>Write and save your markdown content.</p> <div class="card-actions justify-end"><button class="btn btn-primary">Coming Soon</button></div></div></div> <div class="card bg-base-100 shadow-xl"><div class="card-body"><h2 class="card-title">View Content</h2> <p>Browse your previously saved content.</p> <div class="card-actions justify-end"><button class="btn btn-primary">Coming Soon</button></div></div></div> <div class="card bg-base-100 shadow-xl"><div class="card-body"><h2 class="card-title">Settings</h2> <p>Manage your account and preferences.</p> <div class="card-actions justify-end"><button class="btn btn-primary">Coming Soon</button></div></div></div></div></div></div>`;
  bind_props($$props, { data });
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-D1r4c3pk.js.map
