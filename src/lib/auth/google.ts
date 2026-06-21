import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export const isGoogleSignInConfigured = Boolean(webClientId);

let configured = false;
function ensureConfigured() {
  if (configured) return;
  GoogleSignin.configure({ webClientId, iosClientId });
  configured = true;
}

/** Returns the Google id_token on success, or null if the user cancelled. */
export async function signInWithGoogleAsync(): Promise<string | null> {
  if (!isGoogleSignInConfigured) return null;
  ensureConfigured();

  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  const response = await GoogleSignin.signIn();
  if (response.type !== 'success') return null;
  return response.data.idToken;
}
