# Kling AI API Documentation - General Information

## API Domain
```
https://api.klingai.com
```

## API Authentication
The authentication process consists of three steps:

### Step-1: Obtain AccessKey + SecretKey

### Step-2: Generate an API Token using JWT (JSON Web Token, RFC 7519)
- JWT consists of three parts: Header, Payload, Signature
- Use the following code examples to generate your token:

#### Python Example
```python
import time
import jwt

ak = "" # fill access key
sk = "" # fill secret key

def encode_jwt_token(ak, sk):
    headers = {
        "alg": "HS256",
        "typ": "JWT"
    }
    payload = {
        "iss": ak,
        "exp": int(time.time()) + 1800, # The valid time, in this example, represents the current time+1800s(30min)
        "nbf": int(time.time()) - 5 # The time when it starts to take effect, in this example, represents the current time minus 5s
    }
    token = jwt.encode(payload, sk, headers=headers)
    return token

authorization = encode_jwt_token(ak, sk)
print(authorization) # Printing the generated API_TOKEN
```

### Step-3: Use the API Token to assemble the Authorization header
- Format: `Authorization = "Bearer XXX"` where XXX is the API Token from Step 2
- Note: There should be a space between Bearer and XXX

## Error Codes

| HTTP Status Code | Service Code | Definition of Service Code | Explanation of Service Code | Suggested Solutions |
|------------------|--------------|----------------------------|------------------------------|---------------------|
| 200 | 0 | Request | - | - |
| 401 | 1000 | Authentication failed | Authentication failed | Check if the Authorization is correct |
| 401 | 1001 | Authentication failed | Authorization is empty | Fill in the correct Authorization in the Request Header |
| 401 | 1002 | Authentication failed | Authorization is invalid | Fill in the correct Authorization in the Request Header |
| 401 | 1003 | Authentication failed | Authorization is not yet valid | Check the start effective time of the token, wait for it to take effect or reissue |
| 401 | 1004 | Authentication failed | Authorization has expired | Check the validity period of the token and reissue it |
| 429 | 1100 | Account exception | Account exception | Verifying account configuration information |
| 429 | 1101 | Account exception | Account in arrears (postpaid scenario) | Recharge the account to ensure sufficient balance |
| 429 | 1102 | Account exception | Resource pack depleted or expired (prepaid scenario) | Purchase additional resource packages, or activate the post-payment service (if available) |
| 403 | 1103 | Account exception | Unauthorized access to requested resource, such as API/model | Verifying account permissions |
| 400 | 1200 | Invalid request parameters | Invalid request parameters | Check whether the request parameters are correct |
| 400 | 1201 | Invalid request parameters | Invalid parameters, such as incorrect key or illegal value | Refer to the specific information in the message field of the returned body and modify the request parameters |
| 404 | 1202 | Invalid request parameters | The requested method is invalid | Review the API documentation and use the correct request method |
| 404 | 1203 | Invalid request parameters | The requested resource does not exist, such as the model | Refer to the specific information in the message field of the returned body and modify the request parameters |
| 400 | 1300 | Trigger strategy | Trigger strategy of the platform | Check if any platform policies have been triggered |
| 400 | 1301 | Trigger strategy | Trigger the content security policy of the platform | Check the input content, modify it, and resend the request |
| 429 | 1302 | Trigger strategy | The API request is too fast, exceeding the platform's rate limit | Reduce the request frequency, try again later, or contact customer service to increase the limit |
| 429 | 1303 | Trigger strategy | Concurrency or QPS exceeds the prepaid resource package limit | Reduce the request frequency, try again later, or contact customer service to increase the limit |
| 429 | 1304 | Trigger strategy | Trigger the platform's IP whitelisting policy | Contact customer service |
| 500 | 5000 | Internal error | Server internal error | Try again later, or contact customer service |
| 503 | 5001 | Internal error | Server temporarily unavailable, usually due to maintenance | Try again later, or contact customer service |
| 504 | 5002 | Internal error | Server internal timeout, usually due to a backlog | Try again later, or contact customer service |
