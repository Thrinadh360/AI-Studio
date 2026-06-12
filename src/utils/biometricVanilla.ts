/**
 * C-SYNC Pure Vanilla JS Biometric & WebAuthn Manager
 * Utilizes standard native browser APIs for high-security biometrics
 */

export async function checkBiometricHardwareSupport(): Promise<boolean> {
  try {
    if (!window.isSecureContext) {
      console.warn("C-Sync Biometrics: Secure Context (HTTPS/localhost) is required for native WebAuthn.");
      return false;
    }
    if (!window.PublicKeyCredential) {
      return false;
    }
    const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return isAvailable;
  } catch (error) {
    console.warn("C-Sync: Biometric platform availability check failed. Standard interactive haptic fallback enabled.", error);
    return false;
  }
}

/**
 * Triggers native high-fidelity Local Biometrics (TouchID, FaceID, Windows Hello)
 * using the standard browser WebAuthn Credentials API!
 */
export async function performNativeBiometricAuth(username: string = "academic_node_user"): Promise<{ success: boolean; details?: string; fallback?: boolean }> {
  const isSupported = await checkBiometricHardwareSupport();
  if (!isSupported) {
    return { success: false, fallback: true };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const userId = new Uint8Array(16);
    window.crypto.getRandomValues(userId);

    // Standard credential request options for native FaceID/TouchID/Windows Hello
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge: challenge,
      rp: {
        name: "C-Sync Smart Campus Workstation",
        id: window.location.hostname
      },
      user: {
        id: userId,
        name: username,
        displayName: username.toUpperCase()
      },
      pubKeyCredParams: [{
        alg: -7, // ES256
        type: "public-key"
      }],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required"
      },
      timeout: 30000,
      attestation: "none"
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    });

    if (credential) {
      console.log("C-Sync Biometric enrollment token compiled:", credential);
      return { success: true, details: `Token ID: ${credential.id.substring(0, 8)}...` };
    }
    return { success: false };
  } catch (err: any) {
    // Gracefully catch security permissions policy, cross-origin sandbox restrictions or user cancellation
    console.warn("C-Sync: Native WebAuthn request bypassed. Engaging hardware-backed canvas model emulation.", err?.message || err);
    return { success: false, details: err?.message || "Feature restricted by browser frame policy", fallback: true };
  }
}

/**
 * Native authentication attempt with existing hardware keys
 */
export async function verifyNativeBiometry(): Promise<{ success: boolean; message?: string; fallback?: boolean }> {
  const isSupported = await checkBiometricHardwareSupport();
  if (!isSupported) {
    return { success: false, fallback: true };
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge: challenge,
      rpId: window.location.hostname,
      userVerification: "required",
      timeout: 30000
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions
    });

    if (assertion) {
      return { success: true, message: `Verified through credential node ${assertion.id.substring(0, 6)}` };
    }
    return { success: false };
  } catch (err: any) {
    console.warn("C-Sync: Native credential verification bypassed.", err?.message || err);
    return { success: false, fallback: true };
  }
}
