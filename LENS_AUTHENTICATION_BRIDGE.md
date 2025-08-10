# Lens Authentication Bridge

## Overview

The Lens Authentication Bridge is a system that seamlessly connects the native Lens Protocol authentication with our backend JWT-based system. This allows users to authenticate using the familiar Lens Protocol flow while our backend maintains its own session management and user data.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Our Backend    │    │   Lens API      │
│                 │    │                  │    │                 │
│ 1. User logs in │───▶│ 2. Validate Lens │───▶│ 3. Verify Token │
│    with Lens    │    │    Token         │    │                 │
│                 │    │                  │    │                 │
│ 4. Store both   │◀───│ 5. Create our    │◀───│ 6. Return       │
│    tokens       │    │    JWT           │    │    Profile Data │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Backend Implementation

### New Endpoint: `POST /api/auth/sync-lens`

**Purpose**: Validates a Lens access token and creates our own JWT session.

**Request Body**:
```json
{
  "lensAccessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "walletAddress": "0x1234...",
    "status": "Premium",
    "linkedProfileId": "0x5678...",
    "email": "user@example.com",
    "username": "username",
    "displayName": "Display Name",
    "avatarUrl": "https://...",
    "registrationDate": "2024-01-01T00:00:00Z",
    "lastActiveAt": "2024-01-01T00:00:00Z",
    "totalLogins": 1
  },
  "token": "our.jwt.token",
  "isNewUser": false,
  "message": "Lens authentication synced successfully"
}
```

### AuthService.syncLens()

**Method**: `async syncLens(request: SyncLensRequest): Promise<SyncLensResponse>`

**Process**:
1. **Validate Lens Token**: Call Lens API (`https://api.lens.xyz/verify`) to validate the access token
2. **Extract User Data**: Get wallet address and profile ID from Lens API response
3. **Login/Onboard**: Use existing `loginOrOnboard` logic to create or update user in our database
4. **Generate JWT**: Create our own JWT token for session management
5. **Return Data**: Send back user data and our JWT token

### Lens Token Validation

**Method**: `private async validateLensToken(lensAccessToken: string)`

**Process**:
1. Make POST request to `https://api.lens.xyz/verify`
2. Include Lens token in Authorization header
3. Parse response to extract wallet address and profile ID
4. Return user data or null if validation fails

## Frontend Implementation

### Updated Auth Store

The auth store now supports both Lens tokens and our backend JWT:

```typescript
interface State {
  // Lens tokens (existing)
  accessToken: string | null;
  refreshToken: string | null;
  
  // Backend tokens (new)
  backendToken: string | null;
  user: UserData | null;
  
  // Methods
  hydrateAuthTokens: () => Tokens;
  hydrateBackendTokens: () => BackendTokens;
  signIn: (tokens: LensTokens) => void;
  signInWithBackend: (data: BackendTokens) => void;
  signOut: () => void;
}
```

### useLensAuthSync Hook

**Purpose**: Automatically syncs Lens authentication with our backend.

**Features**:
- Auto-detects when Lens token is available but backend token is missing
- Calls `/api/auth/sync-lens` endpoint automatically
- Stores backend JWT and user data in auth store
- Handles errors gracefully

**Usage**:
```typescript
// Automatically runs in Layout component
useLensAuthSync();

// Manual sync
const { syncLens, isPending, error } = useLensAuthSync();
syncLens(lensAccessToken);
```

### Integration in Layout

The `Layout.tsx` component now includes:
```typescript
// Auto-sync Lens authentication with our backend
useLensAuthSync();
```

This ensures that whenever a user authenticates with Lens, our backend is automatically notified and creates its own session.

## API Client Updates

### New Fetcher Method

```typescript
export const hono = {
  auth: {
    syncLens: (lensAccessToken: string): Promise<SyncLensResponse> => {
      return fetchApi("/auth/sync-lens", {
        body: JSON.stringify({ lensAccessToken }),
        method: "POST"
      });
    }
  },
  // ... existing methods
};
```

## User Experience Flow

### 1. User Authentication
1. User clicks "Login" in the app
2. Native Lens authentication modal opens
3. User signs message with their wallet
4. Lens returns access token
5. Frontend stores Lens token

### 2. Automatic Sync
1. `useLensAuthSync` hook detects Lens token
2. Automatically calls `/api/auth/sync-lens`
3. Backend validates token with Lens API
4. Backend creates/updates user in database
5. Backend returns our JWT token
6. Frontend stores both tokens

### 3. Session Management
1. Frontend uses Lens token for Lens Protocol operations
2. Frontend uses our JWT for backend API calls
3. Both tokens are managed independently
4. User sees seamless experience

## Benefits

### For Users
- ✅ Familiar Lens authentication flow
- ✅ No additional sign-up steps
- ✅ Seamless integration with existing Lens ecosystem
- ✅ Premium status automatically detected

### For Developers
- ✅ Leverages existing Lens infrastructure
- ✅ Maintains our own user management system
- ✅ Flexible session management
- ✅ Easy to extend with additional features

### For System
- ✅ Dual authentication support
- ✅ Robust error handling
- ✅ Automatic token validation
- ✅ Scalable architecture

## Testing

### Backend Testing
```bash
# Test the sync-lens endpoint
cd apps/api
npx tsx src/test-lens-sync.ts
```

### Frontend Testing
1. Start the frontend application
2. Authenticate with Lens Protocol
3. Check browser storage for both tokens
4. Verify premium status display
5. Test API calls with backend JWT

## Error Handling

### Backend Errors
- **Invalid Lens Token**: Returns 400/500 with error message
- **Lens API Unavailable**: Returns 500 with network error
- **Database Errors**: Returns 500 with database error
- **Validation Errors**: Returns 400 with validation details

### Frontend Errors
- **Network Errors**: Logged to console, user can retry
- **Token Expiry**: Automatic refresh or re-authentication
- **Sync Failures**: Graceful fallback to Lens-only mode

## Security Considerations

### Token Validation
- All Lens tokens are validated with official Lens API
- No token storage in plain text
- Secure token transmission over HTTPS

### Session Management
- Backend JWT has appropriate expiry
- Tokens stored securely in browser
- Automatic cleanup on logout

### Data Privacy
- Only necessary user data is stored
- Wallet addresses are normalized
- Profile linking is user-controlled

## Future Enhancements

### Planned Features
- [ ] Token refresh mechanism
- [ ] Offline support
- [ ] Multi-wallet support
- [ ] Enhanced error recovery
- [ ] Analytics integration

### Potential Improvements
- [ ] Caching for better performance
- [ ] Rate limiting for API calls
- [ ] Enhanced logging and monitoring
- [ ] A/B testing capabilities

## Troubleshooting

### Common Issues

**Lens token validation fails**
- Check if Lens API is accessible
- Verify token format and expiry
- Check network connectivity

**Backend JWT not generated**
- Verify database connectivity
- Check environment variables
- Review server logs

**Frontend sync not working**
- Check browser console for errors
- Verify API endpoint accessibility
- Check auth store state

### Debug Steps
1. Check browser network tab for API calls
2. Review server logs for backend errors
3. Verify environment variables
4. Test with known valid Lens token
5. Check database for user records

## Conclusion

The Lens Authentication Bridge provides a seamless integration between Lens Protocol authentication and our backend system. Users get the familiar Lens experience while our backend maintains full control over user data and session management. This architecture is scalable, secure, and ready for future enhancements. 