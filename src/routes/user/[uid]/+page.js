import { fire, auth } from '$lib/plugins/firebase/firebase.js';

export const load = async ({ params }) => {
	const username = await fire.fetchUsername(params.uid);
	const memes = await fire.fetchUserMemes(params.uid);
	const followers = await fire.fetchFollowers(params.uid);

	return { uid: params.uid, username, memes, followers };
};
