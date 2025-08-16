import firebase from 'firebase/app';
import 'firebase/analytics';

const firebaseConfigEnvVar = {
	apiKey: import.meta.env.VITE_FB_API_KEY,
	authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FB_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FB_APP_ID,
	measurementId: import.meta.env.VITE_FB_MEASUREMENT_ID,
};


// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FB_API_KEY,
//   authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FB_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FB_APP_ID,
//   measurementId: import.meta.env.VITE_FB_MEASUREMENT_ID,
// };
console.log('process analytics env:', import.meta.env); 
// console.log('VITE_FB_API_KEY:', import.meta.env.VITE_FB_API_KEY);
console.log('process env', process.env);
console.log('Firebase config:', firebaseConfigEnvVar);
// Initialize Firebase

const firebaseConfig = {
  apiKey: "AIzaSyBn-WU9vVw9mCwlzlLnSUAUWLG4j1VGo2o",
  authDomain: "planning-poker-tj.firebaseapp.com",
  projectId: "planning-poker-tj",
  storageBucket: "planning-poker-tj.firebasestorage.app",
  messagingSenderId: "778646963505",
  appId: "1:778646963505:web:d1f18e7352de022cba1c10",
  measurementId: "G-D07JNP3F89"
};


// Debug missing configuration in production (safe values are just presence/length, not actual secrets)
const missing = Object.entries(firebaseConfig)
	.filter(([_, v]) => !v)
	.map(([k]) => k);
if (missing.length) {
	// eslint-disable-next-line no-console
	console.warn('[firebase] Missing env vars:', missing.join(', '));
}

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
