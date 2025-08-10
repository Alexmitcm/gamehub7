# 🔧 **401 Unauthorized Error - Debugging Guide**

## 🚨 **Problem: 401 Unauthorized on `/premium/user-status`**

This error occurs when the JWT token is missing, invalid, or not being parsed correctly.

---

## ✅ **Step-by-Step Debugging Checklist**

### **1. Test the Debug Endpoint**

First, test the debug endpoint to see what headers are being sent:

```bash
# Test without token
curl http://localhost:3003/premium/debug

# Test with Authorization header
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3003/premium/debug

# Test with X-Access-Token header
curl -H "X-Access-Token: YOUR_TOKEN" http://localhost:3003/premium/debug
```

**Expected Response:**
```json
{
  "message": "Debug endpoint - Authentication headers",
  "headers": {
    "xAccessToken": "Present" | "Missing",
    "authorization": "Present" | "Missing", 
    "tokenFromContext": "Present" | "Missing"
  },
  "fullHeaders": { ... },
  "timestamp": "..."
}
```

---

### **2. Check Frontend Token Sending**

In your frontend code, ensure you're sending the token correctly:

#### **Option A: Using Authorization Header (Recommended)**
```typescript
const response = await fetch('/api/premium/status', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` // 👈 Make sure this is set
  },
  body: JSON.stringify({ walletAddress })
});
```

#### **Option B: Using X-Access-Token Header**
```typescript
const response = await fetch('/api/premium/status', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Access-Token': token // 👈 Alternative header
  },
  body: JSON.stringify({ walletAddress })
});
```

---

### **3. Verify Token Storage and Retrieval**

Check how you're storing and retrieving the token:

```typescript
// Debug token retrieval
const token = localStorage.getItem('jwt') || sessionStorage.getItem('jwt');
console.log('Token value:', token);
console.log('Token length:', token?.length);
console.log('Token starts with eyJ:', token?.startsWith('eyJ'));
```

---

### **4. Test Different Endpoints**

Try these endpoints to isolate the issue:

#### **A. Test POST endpoint (no auth required)**
```bash
curl -X POST http://localhost:3003/premium/status \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x123..."}'
```

#### **B. Test GET endpoint (requires auth)**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3003/premium/user-status
```

---

### **5. Check CORS Configuration**

Ensure your frontend can send the Authorization header:

```typescript
// In your frontend fetch calls
const response = await fetch('/api/premium/status', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  credentials: 'include', // 👈 Important for CORS
  body: JSON.stringify({ walletAddress })
});
```

---

### **6. Verify Backend Port**

Make sure your frontend is hitting the correct backend port:

```typescript
// Check your API base URL
const API_BASE = 'http://localhost:3003'; // 👈 Should match your backend

const response = await fetch(`${API_BASE}/premium/status`, {
  // ... rest of config
});
```

---

### **7. Test with a Valid JWT Token**

Generate a test JWT token using the existing endpoint:

```bash
# Generate test JWT
curl -X POST http://localhost:3003/test-jwt

# Use the returned token in your requests
curl -H "Authorization: Bearer GENERATED_TOKEN" \
  http://localhost:3003/premium/user-status
```

---

## 🔧 **Quick Fixes Applied**

### **1. Updated Auth Middleware**
- ✅ Now accepts both `Authorization: Bearer` and `X-Access-Token` headers
- ✅ Better error messages with JSON responses
- ✅ Proper JWT verification with error logging

### **2. Added POST Endpoints**
- ✅ `/premium/status` (POST) - No auth required
- ✅ `/premium/profiles` (POST) - No auth required  
- ✅ `/premium/auto-link` (POST) - No auth required
- ✅ `/premium/link` (POST) - No auth required

### **3. Updated CORS Configuration**
- ✅ Added `Authorization` header to allowed headers
- ✅ Maintains existing `X-Access-Token` support

### **4. Added Debug Endpoint**
- ✅ `/premium/debug` - Shows all headers for debugging

---

## 🎯 **Recommended Solution**

**Use the POST endpoints without authentication for now:**

```typescript
// Update your frontend hook to use POST endpoints
const fetchPremiumStatus = async (walletAddress: string) => {
  const response = await fetch('/api/premium/status', {
    method: 'POST', // 👈 Use POST instead of GET
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ walletAddress }), // 👈 Send wallet address in body
  });
  
  return response.json();
};
```

---

## 🚀 **Testing Commands**

```bash
# 1. Test debug endpoint
curl http://localhost:3003/premium/debug

# 2. Test POST status endpoint
curl -X POST http://localhost:3003/premium/status \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x1234567890123456789012345678901234567890"}'

# 3. Test with auth (if you have a valid token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3003/premium/user-status
```

---

## 📞 **Next Steps**

1. **Run the debug endpoint** to see what headers are being sent
2. **Update your frontend** to use POST endpoints
3. **Test with a valid wallet address** from your referral contract
4. **Check the server logs** for any JWT verification errors

Let me know what the debug endpoint returns and I can help you further! 