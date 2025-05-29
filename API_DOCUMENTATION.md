# Sea of Secrets API Documentation

## Base URL
```
http://localhost:3000/api/secrets
```

## Content Types Supported
- `application/json`
- `multipart/form-data`
- `application/x-www-form-urlencoded`

## Response Format
All responses follow this structure:
```json
{
  "status": "success" | "fail" | "error",
  "data": {}, // Present on success
  "message": "string", // Present on some responses
  "error": {}, // Present on error
  "pagination": {} // Present on paginated responses
}
```

---

## Endpoints

### 1. Create Secret
Creates a new secret and returns a unique key for deletion.

**Endpoint:** `POST /api/secrets/create`

**Request Body (JSON):**
```json
{
  "content": "Your secret message here"
}
```

**Request Body (Form Data):**
```
content: "Your secret message here"
```

**Success Response (201):**
```json
{
  "status": "success",
  "data": {
    "secret": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "key": "a1b2c3d4e5f6g7h8i9j0k1l2",
      "createdAt": "2024-01-20T10:30:00.000Z"
    }
  }
}
```

**Error Response (400):**
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400,
    "status": "fail",
    "isOperational": true
  },
  "message": "Content is required to create a secret"
}
```

**cURL Example:**
```bash
# JSON
curl -X POST http://localhost:3000/api/secrets/create \
  -H "Content-Type: application/json" \
  -d '{"content": "This is my secret message"}'

# Form Data
curl -X POST http://localhost:3000/api/secrets/create \
  -F "content=This is my secret message"
```

**JavaScript Example:**
```javascript
// Using fetch with JSON
const response = await fetch('http://localhost:3000/api/secrets/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    content: 'This is my secret message'
  })
});

// Using fetch with FormData
const formData = new FormData();
formData.append('content', 'This is my secret message');

const response = await fetch('http://localhost:3000/api/secrets/create', {
  method: 'POST',
  body: formData
});
```

---

### 2. Get Random Secrets
Retrieves a random selection of secrets (without content or keys for security). Perfect for reels-like browsing experience. Supports excluding already seen secrets to ensure fresh content.

**Endpoint:** `GET /api/secrets` or `POST /api/secrets` (for large seenSecrets arrays)

**Query Parameters:**
- `limit` (number, optional): Number of random secrets to return (default: 10, max recommended: 50)
- `seenSecrets` (string, optional): Comma-separated list of secret IDs to exclude (e.g., "id1,id2,id3")

**Request Body (Optional - for POST requests with large arrays):**
```json
{
  "seenSecrets": [
    "60f7b3b3b3b3b3b3b3b3b3b3",
    "60f7b3b3b3b3b3b3b3b3b3b4",
    "60f7b3b3b3b3b3b3b3b3b3b5"
  ]
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "results": 5,
  "total": 25,
  "excluded": 3,
  "data": {
    "secrets": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b6",
        "isDeleted": false,
        "createdAt": "2024-01-20T10:30:00.000Z",
        "updatedAt": "2024-01-20T10:30:00.000Z"
      },
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b7",
        "isDeleted": false,
        "createdAt": "2024-01-20T09:15:00.000Z",
        "updatedAt": "2024-01-20T09:15:00.000Z"
      }
    ]
  }
}
```

**Error Response (400 - Invalid IDs):**
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400,
    "status": "fail",
    "isOperational": true
  },
  "message": "Invalid secret IDs provided in seenSecrets"
}
```

**Note:** 
- Each request returns a different random selection of secrets, excluding the ones already seen
- Perfect for infinite scroll where users never see the same content twice
- The `excluded` field shows how many secrets were filtered out
- Use GET with query params for small arrays, POST with body for large arrays

**cURL Example:**
```bash
# Get random secrets (default 10, no exclusions)
curl -X GET http://localhost:3000/api/secrets

# Get 5 random secrets excluding specific IDs (using query params)
curl -X GET "http://localhost:3000/api/secrets?limit=5&seenSecrets=60f7b3b3b3b3b3b3b3b3b3b3,60f7b3b3b3b3b3b3b3b3b3b4"

# Get random secrets excluding many IDs (using POST with body)
curl -X POST http://localhost:3000/api/secrets \
  -H "Content-Type: application/json" \
  -d '{
    "seenSecrets": [
      "60f7b3b3b3b3b3b3b3b3b3b3",
      "60f7b3b3b3b3b3b3b3b3b3b4",
      "60f7b3b3b3b3b3b3b3b3b3b5"
    ]
  }'
```

**JavaScript Example:**
```javascript
// Get random secrets (no exclusions)
const response = await fetch('http://localhost:3000/api/secrets?limit=10');

// Get random secrets excluding seen ones (small array - using query params)
const seenIds = ['60f7b3b3b3b3b3b3b3b3b3b3', '60f7b3b3b3b3b3b3b3b3b3b4'];
const response = await fetch(
  `http://localhost:3000/api/secrets?limit=10&seenSecrets=${seenIds.join(',')}`
);

// Get random secrets excluding many seen ones (large array - using POST)
const seenSecrets = ['id1', 'id2', 'id3', /* ...many more IDs */];
const response = await fetch('http://localhost:3000/api/secrets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ seenSecrets })
});

// Function to get fresh random secrets with exclusions
const getRandomSecrets = async (limit = 10, seenSecrets = []) => {
  if (seenSecrets.length > 10) {
    // Use POST for large arrays
    const response = await fetch('http://localhost:3000/api/secrets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seenSecrets })
    });
    return await response.json();
  } else {
    // Use GET for small arrays
    const query = new URLSearchParams({ limit });
    if (seenSecrets.length > 0) {
      query.append('seenSecrets', seenSecrets.join(','));
    }
    const response = await fetch(`http://localhost:3000/api/secrets?${query}`);
    return await response.json();
  }
};
```

---

### 3. Get Secret by ID
Retrieves a specific secret's content using its ID.

**Endpoint:** `GET /api/secrets/:id`

**URL Parameters:**
- `id` (string, required): The MongoDB ObjectId of the secret

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "secret": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "content": "This is the secret message",
      "isDeleted": false,
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-20T10:30:00.000Z"
    }
  }
}
```

**Error Response (404):**
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404,
    "status": "fail",
    "isOperational": true
  },
  "message": "No secret found with that ID"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/secrets/60f7b3b3b3b3b3b3b3b3b3b3
```

**JavaScript Example:**
```javascript
const secretId = '60f7b3b3b3b3b3b3b3b3b3b3';
const response = await fetch(`http://localhost:3000/api/secrets/${secretId}`);
const data = await response.json();
```

---

### 4. Delete Secret
Soft deletes a secret using its unique key (obtained when creating the secret).

**Endpoint:** `DELETE /api/secrets/delete`

**Request Body (JSON):**
```json
{
  "key": "a1b2c3d4e5f6g7h8i9j0k1l2"
}
```

**Request Body (Form Data):**
```
key: "a1b2c3d4e5f6g7h8i9j0k1l2"
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Secret successfully deleted"
}
```

**Error Response (400):**
```json
{
  "status": "fail",
  "error": {
    "statusCode": 400,
    "status": "fail",
    "isOperational": true
  },
  "message": "Key is required to delete a secret"
}
```

**Error Response (404):**
```json
{
  "status": "fail",
  "error": {
    "statusCode": 404,
    "status": "fail",
    "isOperational": true
  },
  "message": "No secret found with that key or secret already deleted"
}
```

**cURL Example:**
```bash
# JSON
curl -X DELETE http://localhost:3000/api/secrets/delete \
  -H "Content-Type: application/json" \
  -d '{"key": "a1b2c3d4e5f6g7h8i9j0k1l2"}'

# Form Data
curl -X DELETE http://localhost:3000/api/secrets/delete \
  -F "key=a1b2c3d4e5f6g7h8i9j0k1l2"
```

**JavaScript Example:**
```javascript
// Using fetch with JSON
const response = await fetch('http://localhost:3000/api/secrets/delete', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    key: 'a1b2c3d4e5f6g7h8i9j0k1l2'
  })
});

// Using fetch with FormData
const formData = new FormData();
formData.append('key', 'a1b2c3d4e5f6g7h8i9j0k1l2');

const response = await fetch('http://localhost:3000/api/secrets/delete', {
  method: 'DELETE',
  body: formData
});
```

---

## Error Handling

### Common HTTP Status Codes
- `200` - Success
- `201` - Created (for new secrets)
- `400` - Bad Request (missing or invalid data)
- `404` - Not Found (secret doesn't exist)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

### Error Response Structure
```json
{
  "status": "fail" | "error",
  "error": {
    "statusCode": number,
    "status": "fail" | "error",
    "isOperational": boolean
  },
  "message": "Error description"
}
```

---

## Rate Limiting
- **Limit:** 1000 requests per hour per IP
- **Response:** 429 status code with message "Too many requests from this IP, please try again in an hour!"

---

## CORS Policy
- **Allowed Origins:** All (`*`)
- **Allowed Methods:** `GET, HEAD, PUT, PATCH, POST, DELETE`
- **Allowed Headers:** All (`*`)
- **Credentials:** Supported

---

## Frontend Integration Examples

### React Hook Example
```javascript
// useSecrets.js
import { useState, useEffect } from 'react';

export const useSecrets = () => {
  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const createSecret = async (content) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/secrets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      
      if (!response.ok) throw new Error('Failed to create secret');
      
      const data = await response.json();
      return data.data.secret;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };const getSecrets = async (limit = 10, seenSecrets = []) => {
    setLoading(true);
    try {
      let response;
      
      if (seenSecrets.length > 10) {
        // Use POST for large arrays
        response = await fetch('http://localhost:3000/api/secrets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seenSecrets })
        });
      } else {
        // Use GET for small arrays
        const query = new URLSearchParams({ limit });
        if (seenSecrets.length > 0) {
          query.append('seenSecrets', seenSecrets.join(','));
        }
        response = await fetch(`http://localhost:3000/api/secrets?${query}`);
      }
      
      if (!response.ok) throw new Error('Failed to fetch secrets');
      
      const data = await response.json();
      setSecrets(data.data.secrets);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSecret = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/secrets/${id}`);
      
      if (!response.ok) throw new Error('Secret not found');
      
      const data = await response.json();
      return data.data.secret;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSecret = async (key) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/secrets/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      });
      
      if (!response.ok) throw new Error('Failed to delete secret');
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    secrets,
    loading,
    error,
    createSecret,
    getSecrets,
    getSecret,
    deleteSecret
  };
};
```

### Vue.js Service Example
```javascript
// secretService.js
class SecretService {
  constructor(baseURL = 'http://localhost:3000/api/secrets') {
    this.baseURL = baseURL;
  }
  async createSecret(content) {
    const response = await fetch(`${this.baseURL}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  }async getSecrets(limit = 10, seenSecrets = []) {
    let response;
    
    if (seenSecrets.length > 10) {
      // Use POST for large arrays
      response = await fetch(this.baseURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seenSecrets })
      });
    } else {
      // Use GET for small arrays
      const query = new URLSearchParams({ limit });
      if (seenSecrets.length > 0) {
        query.append('seenSecrets', seenSecrets.join(','));
      }
      response = await fetch(`${this.baseURL}?${query}`);
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch secrets');
    }

    return response.json();
  }

  async getSecret(id) {
    const response = await fetch(`${this.baseURL}/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  }

  async deleteSecret(key) {
    const response = await fetch(`${this.baseURL}/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    return response.json();
  }
}

export default new SecretService();
```

---

## Testing with Postman

### Environment Variables
Create a Postman environment with:
```
base_url: http://localhost:3000/api/secrets
```

### Collection Structure
1. **Create Secret** - POST {{base_url}}
2. **Get All Secrets** - GET {{base_url}}
3. **Get Secret by ID** - GET {{base_url}}/{{secret_id}}
4. **Delete Secret** - DELETE {{base_url}}/delete

### Test Scripts
Add to your Postman tests:
```javascript
// For Create Secret
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has secret data", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("success");
    pm.expect(jsonData.data.secret).to.have.property("id");
    pm.expect(jsonData.data.secret).to.have.property("key");
});

// Save secret key for deletion test
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.environment.set("secret_key", jsonData.data.secret.key);
    pm.environment.set("secret_id", jsonData.data.secret.id);
}
```

---

## Security Notes

1. **Keys are not returned** in GET requests for security
2. **Content is not returned** in the list endpoint
3. **Soft deletion** - secrets are marked as deleted, not permanently removed
4. **Rate limiting** prevents abuse
5. **CORS** is configured for cross-origin requests
6. **Input validation** ensures required fields are present

---

## Deployment Considerations

### Environment Variables
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/sea-of-secrets
```

### Production URL
Update base URL in frontend to your production domain:
```
https://your-api-domain.com/api/secrets
```
