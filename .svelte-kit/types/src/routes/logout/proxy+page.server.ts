// @ts-nocheck
import { redirect } from '@sveltejs/kit';
import { deleteSession } from '$lib/server/auth.js';
import type { Actions } from './$types.js';

export const actions = {
	default: async ({ locals, cookies }: import('./$types').RequestEvent) => {
		if (locals.session) {
			await deleteSession(locals.session.id);
		}
		
		cookies.delete('session', { path: '/' });
		redirect(302, '/');
	}
};
;null as any as Actions;