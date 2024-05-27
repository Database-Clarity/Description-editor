import { redirect } from '@sveltejs/kit'

// If user enters .../descriptionEditor/, redirect to /descriptionEditor/0
export function load() {
  redirect(303, '/descriptionEditor/0')
}
