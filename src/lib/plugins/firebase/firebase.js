import {
	getAuth,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	updateProfile,
	verifyBeforeUpdateEmail,
	updatePassword,
	deleteUser,
	sendEmailVerification
} from 'firebase/auth';
import {
	getFirestore,
	doc,
	addDoc,
	collection,
	query,
	where,
	getDocs,
	orderBy,
	updateDoc,
	arrayUnion,
	arrayRemove,
	deleteDoc
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import app from '$lib/plugins/firebase/firebase_config';

import { v4 as uuidv4 } from 'uuid';

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const fire = {
	signupUser: async (username, email, password) => {
		try {
			const q = query(collection(db, 'user-info'), where('username', '==', username));
			const querySnapshot = await getDocs(q);

			if (querySnapshot.docs[0] != undefined) return { status: false, error: 'Username exists' };
			else {
				await createUserWithEmailAndPassword(auth, email, password);
				await updateProfile(auth.currentUser, {
					displayName: username
				});

				sendEmailVerification(auth.currentUser);

				await addDoc(collection(db, 'user-info'), {
					username,
					uid: auth.currentUser.uid,
					followers: [],
					following: []
				});

				return { status: true };
			}
		} catch (err) {
			console.log(err);
			return { status: false, error: err.message };
		}
	},
	logoutUser: async () => {
		try {
			await signOut(auth);
			return { status: true };
		} catch (err) {
			return { status: false, error: err.message };
		}
	},
	loginUser: async (email, password) => {
		try {
			await signInWithEmailAndPassword(auth, email, password);

			return { status: true };
		} catch (err) {
			return { status: false, error: err.message };
		}
	},
	uploadMeme: async (file, fileExtension) => {
		try {
			const randomID = uuidv4();
			const storageRef = ref(storage, `memes/${auth.currentUser.uid}_${randomID}.${fileExtension}`);

			await uploadBytes(storageRef, file);
			const downloadURL = await getDownloadURL(storageRef);

			await addDoc(collection(db, 'memes'), {
				poster: auth.currentUser.uid,
				posterUsername: auth.currentUser.displayName,
				memeID: randomID,
				downloadURL: downloadURL,
				fileAddress: `memes/${auth.currentUser.uid}_${randomID}.${fileExtension}`,
				likesCount: 0,
				likes: [],
				comments: [],
				dateUploaded: Date.now()
			});

			return { status: true };
		} catch (err) {
			console.log(err);
			return { status: false, error: err.message };
		}
	},
	loadLatest: async () => {
		const memesQuery = query(collection(db, 'memes'), orderBy('dateUploaded', 'desc'));
		const snapshot = await getDocs(memesQuery);

		const memes = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		}));

		return memes;
	},
	addLike: async (memeID) => {
		try {
			const memeQuery = query(collection(db, 'memes'), where('memeID', '==', memeID));
			const meme = await getDocs(memeQuery);

			await updateDoc(meme.docs[0].ref, {
				likes: arrayUnion(auth.currentUser.uid),
				likesCount: meme.docs[0].data().likesCount + 1
			});
		} catch (err) {
			console.log(err.message);
		}
	},
	removeLike: async (memeID) => {
		try {
			const memeQuery = query(collection(db, 'memes'), where('memeID', '==', memeID));
			const meme = await getDocs(memeQuery);

			await updateDoc(meme.docs[0].ref, {
				likes: arrayRemove(auth.currentUser.uid),
				likesCount: meme.docs[0].data().likesCount - 1
			});
		} catch (err) {
			console.log(err.message);
		}
	},
	deleteMeme: async (memeID) => {
		try {
			const memeQuery = query(collection(db, 'memes'), where('memeID', '==', memeID));
			const meme = await getDocs(memeQuery);

			const memeFile = ref(storage, meme.docs[0].data().fileAddress);

			await deleteDoc(meme.docs[0].ref);
			await deleteObject(memeFile);
		} catch (err) {
			console.log(err.message);
		}
	},
	loadTrending: async () => {
		const memesQuery = query(collection(db, 'memes'), orderBy('likesCount', 'desc'));
		const snapshot = await getDocs(memesQuery);

		const memes = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		}));

		return memes;
	},
	fetchMeme: async (memeID) => {
		const memeQuery = query(collection(db, 'memes'), where('memeID', '==', memeID));
		const snapshot = await getDocs(memeQuery);

		return snapshot.docs[0].data();
	},
	addComment: async (memeID, comment) => {
		try {
			const memeQuery = query(collection(db, 'memes'), where('memeID', '==', memeID));
			const snapshot = await getDocs(memeQuery);

			const memeRef = snapshot.docs[0].ref;

			await updateDoc(memeRef, {
				comments: arrayUnion({
					comment,
					poster: auth.currentUser.uid,
					posterUsername: auth.currentUser.displayName
				})
			});
		} catch (err) {
			console.log(err);
		}
	},
	deleteComment: async (memeID, updatedCommentsArray) => {
		try {
			const memeQuery = query(collection(db, 'memes'), where('memeID', '==', memeID));
			const snapshot = await getDocs(memeQuery);

			const memeRef = snapshot.docs[0].ref;

			await updateDoc(memeRef, {
				comments: updatedCommentsArray
			});
		} catch (err) {
			console.log(err);
		}
	},
	fetchUsername: async (uid) => {
		const usernameQuery = query(collection(db, 'user-info'), where('uid', '==', uid));
		const snapshot = await getDocs(usernameQuery);

		const usernameDoc = snapshot.docs[0].data();

		return usernameDoc.username;
	},
	fetchUserMemes: async (uid) => {
		const memesQuery = query(collection(db, 'memes'), where('poster', '==', uid));
		const snapshot = await getDocs(memesQuery);

		const memes = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data()
		}));

		return memes;
	},
	followUser: async (uid) => {
		const userQuery = query(collection(db, 'user-info'), where('uid', '==', uid));
		const updateOwnDocQuery = query(
			collection(db, 'user-info'),
			where('uid', '==', auth.currentUser.uid)
		);

		const snapshot1 = await getDocs(userQuery);
		const snapshot2 = await getDocs(updateOwnDocQuery);

		await updateDoc(snapshot1.docs[0].ref, {
			followers: arrayUnion(auth.currentUser.uid)
		});

		await updateDoc(snapshot2.docs[0].ref, {
			following: arrayUnion(uid)
		});
	},
	unfollowUser: async (uid) => {
		const userQuery = query(collection(db, 'user-info'), where('uid', '==', uid));
		const updateOwnDocQuery = query(
			collection(db, 'user-info'),
			where('uid', '==', auth.currentUser.uid)
		);

		const snapshot1 = await getDocs(userQuery);
		const snapshot2 = await getDocs(updateOwnDocQuery);

		await updateDoc(snapshot1.docs[0].ref, {
			followers: arrayRemove(auth.currentUser.uid)
		});

		await updateDoc(snapshot2.docs[0].ref, {
			following: arrayRemove(uid)
		});
	},
	fetchFollowers: async (uid) => {
		const userQuery = query(collection(db, 'user-info'), where('uid', '==', uid));
		const snapshot = await getDocs(userQuery);

		return snapshot.docs[0].data().followers;
	},
	fetchFollowingMemes: async () => {
		// fetching the array of following of currentuser first
		const followingArrayQuery = query(
			collection(db, 'user-info'),
			where('uid', '==', auth.currentUser.uid)
		);
		const followingArrayQuerySnapshot = await getDocs(followingArrayQuery);

		const followingArray = followingArrayQuerySnapshot.docs[0].data().following;

		// now fetching the memes of all followers in the followingArray
		const memesQuery = query(collection(db, 'memes'));
		const memes = await getDocs(memesQuery);

		const followingMemesData = memes.docs.map((doc) => doc.data());
		const followingMemes = followingMemesData.filter((meme) => {
			if (followingArray.includes(meme.poster)) return true;
		});

		return followingMemes;
	},
	changeUsername: async (newUsername) => {
		try {
			// How to implement

			// 1. Change username in user info obviously
			const userQuery = query(
				collection(db, 'user-info'),
				where('uid', '==', auth.currentUser.uid)
			);
			const userDocRef = await getDocs(userQuery);

			await updateDoc(userDocRef.docs[0].ref, {
				username: newUsername
			});

			// 2. Find all the memes in which the user has commented
			const memesQuery = query(collection(db, 'memes'));
			const memes = await getDocs(memesQuery);

			const commentedMemes = memes.docs.filter((doc) => {
				const meme = doc.data();
				const filteredComments = meme.comments.filter((comment) => {
					if (comment.poster == auth.currentUser.uid) {
						return true;
					}
				});

				if (filteredComments.length != 0) {
					return true;
				}
			});

			// 3. Extract the comments array, change the username of the user in that array, then updateDoc and change the comments to the new comments array
			commentedMemes.forEach(async (meme) => {
				const docRef = meme.ref;
				const docData = meme.data();

				docData.comments.forEach((comment) => {
					if (comment.poster == auth.currentUser.uid) {
						docData.comments[docData.comments.indexOf(comment)] = {
							comment: comment.comment,
							poster: auth.currentUser.uid,
							posterUsername: newUsername
						};
					}
				});

				await updateDoc(docRef, {
					comments: docData.comments
				});
			});

			// 4. Easy part - in all memes posted by the user, updateDoc the posterUsername and done
			const postedMemesQuery = query(
				collection(db, 'memes'),
				where('poster', '==', auth.currentUser.uid)
			);
			const postedMemes = await getDocs(postedMemesQuery);

			postedMemes.docs.forEach(async (doc) => {
				await updateDoc(doc.ref, {
					posterUsername: newUsername
				});
			});
		} catch (err) {
			console.log(err);
		}
	},
	changeEmail: async (oldEmail, newEmail, password) => {
		try {
			await signInWithEmailAndPassword(auth, oldEmail, password);
			await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
		} catch (err) {
			console.log(err);
		}
	},
	changePassword: async (email, oldPassword, newPassword) => {
		try {
			await signInWithEmailAndPassword(auth, email, oldPassword);
			await updatePassword(auth.currentUser, newPassword);
		} catch (err) {
			console.log(err);
		}
	},
	deleteAccount: async (email, password) => {
		try {
			// 1. Delete user info obviously
			const userQuery = query(
				collection(db, 'user-info'),
				where('uid', '==', auth.currentUser.uid)
			);
			const userDocRef = await getDocs(userQuery);

			const userFollowing = userDocRef.docs[0].data().following;

			await deleteDoc(userDocRef.docs[0].ref);

			userFollowing.forEach(async (following) => {
				const followingDocQuery = query(collection(db, 'user-info'), where('uid', '==', following));
				const followingDoc = await getDocs(followingDocQuery);

				let updatedFollowersArray = followingDoc.docs[0].data().followers;
				updatedFollowersArray.splice(updatedFollowersArray.indexOf(following), 1);

				updateDoc(followingDoc.docs[0].ref, {
					followers: updatedFollowersArray
				});
			});

			// 2. Find all the memes in which the user has commented
			const memesQuery = query(collection(db, 'memes'));
			const memes = await getDocs(memesQuery);

			const commentedMemes = memes.docs.filter((doc) => {
				const meme = doc.data();
				const filteredComments = meme.comments.filter((comment) => {
					if (comment.poster == auth.currentUser.uid) {
						return true;
					}
				});

				if (filteredComments.length != 0) {
					return true;
				}
			});

			// 3. Extract the comments array, change the username of the user in that array, then updateDoc and change the comments to the new comments array
			commentedMemes.forEach(async (meme) => {
				const docRef = meme.ref;
				const docData = meme.data();

				docData.comments.forEach((comment) => {
					if (comment.poster == auth.currentUser.uid) {
						docData.comments.splice(docData.comments.indexOf(comment));
					}
				});

				await updateDoc(docRef, {
					comments: docData.comments
				});
			});

			// 4. Easy part - in all memes posted by the user, updateDoc the posterUsername and done
			const postedMemesQuery = query(
				collection(db, 'memes'),
				where('poster', '==', auth.currentUser.uid)
			);
			const postedMemes = await getDocs(postedMemesQuery);

			postedMemes.docs.forEach(async (doc) => {
				await deleteDoc(doc.ref);
			});

			await signInWithEmailAndPassword(auth, email, password);
			await deleteUser(auth.currentUser);
		} catch (err) {
			console.log(err);
		}
	},
	signoutUser: () => {
		signOut(auth);
	}
};

export { auth, fire };
