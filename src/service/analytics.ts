import firebase from 'firebase/app';
import 'firebase/analytics';

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FB_API_KEY,
	authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FB_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FB_APP_ID,
	measurementId: import.meta.env.VITE_FB_MEASUREMENT_ID,
};

// Initialize only once
if (!firebase.apps.length) {
	try {
		firebase.initializeApp(firebaseConfig as any);
	} catch (e) {
		// swallow duplicate init race condition in fast refresh
	}
}

try {
	firebase.analytics();
} catch (e) {
	// analytics may be disabled in some environments
}
