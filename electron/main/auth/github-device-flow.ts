// GitHub Device Authorization Flow
// Full implementation in Phase 5

export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export async function requestDeviceCode(_clientId: string): Promise<DeviceCodeResponse> {
  // TODO: Implement GitHub Device Flow
  throw new Error('GitHub Device Flow not yet implemented');
}

export async function pollForToken(
  _clientId: string,
  _deviceCode: string,
  _interval: number,
): Promise<string> {
  // TODO: Implement token polling
  throw new Error('GitHub Device Flow not yet implemented');
}
