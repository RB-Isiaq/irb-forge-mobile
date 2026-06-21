import { useMemo } from 'react';
import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import {
  makeRedirectUri,
  ResponseType,
  useAuthRequest,
  type AuthSessionResult,
} from 'expo-auth-session';
import { discovery } from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

function resolveClientId(): string | undefined {
  if (Platform.OS === 'ios') return process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  if (Platform.OS === 'android') return process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  return process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
}

export function useGoogleSignInRequest() {
  const clientId = resolveClientId();
  const nonce = useMemo(() => Crypto.randomUUID(), []);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: clientId ?? '',
      responseType: ResponseType.IdToken,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: makeRedirectUri({ scheme: 'irbforgemobile' }),
      extraParams: { nonce },
    },
    discovery
  );

  return { request, response, promptAsync, isConfigured: Boolean(clientId) };
}

export function extractIdToken(response: AuthSessionResult | null): string | null {
  if (response?.type !== 'success') return null;
  return response.params.id_token ?? null;
}
