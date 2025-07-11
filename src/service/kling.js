// Server-side utilities for interacting with the Kling API
const API_DOMAIN = 'https://api.klingai.com';

const parseKlingKeys = () => {
    const keyString = process.env.KLING_KEYS || '';
    const keySets = keyString.split(',').map((set) => set.trim());
    return keySets.map((set) => {
        const [accessKey, secretKey] = set.split(':').map((key) => key.trim());
        return { accessKey, secretKey };
    });
};

const KlingKeys = parseKlingKeys();
if (!KlingKeys || KlingKeys.length === 0) {
    console.warn('Kling AI API keys are not set in environment variables.');
}

// Customized way to get the access key and secret key for kling API
// Kling has a very tight rate limit (4 concurrent requests) and monthly non-carryover quota.
// To avoid hitting the limit and try to use all the keys evenly, we implement this key picker to
// 1. randomly pick a key
// 2. if previous key hit the limit, allow it to try the next one
// 3. if all keys are used, return None
const keyPicker = (history) => {
    // step 1. check if history has all the possible keys
    // if so, return None, indicating no key available

    // step 2. create a list containing all the keys that are not in history
    // randomly pick one from the list
    // return the picked key and updated history
    const availableKeys = KlingKeys.filter((key) => !history.includes(key.accessKey));
    if (availableKeys.length === 0) {
        return { key: null, history };
    }

    const pickedKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
    history.push(pickedKey.accessKey);
    return { key: pickedKey, history };
};

const TOKEN_EXPIRATION = parseInt(process.env.KLING_TOKEN_EXPIRATION || '1800', 10);

// Token generation for Kling API authentication
async function generateToken() {
    const headers = {
        alg: 'HS256',
        typ: 'JWT',
    };

    const payload = {
        iss: ACCESS_KEY,
        exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRATION, // Valid for 30 minutes by default
        nbf: Math.floor(Date.now() / 1000) - 5, // Valid from 5 seconds ago
    };

    const base64url = (buffer) => {
        return btoa(String.fromCharCode(...new Uint8Array(buffer)))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    };

    const encodedHeader = base64url(new TextEncoder().encode(JSON.stringify(headers)));
    const encodedPayload = base64url(new TextEncoder().encode(JSON.stringify(payload)));
    const data = `${encodedHeader}.${encodedPayload}`;

    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(SECRET_KEY),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));

    const encodedSignature = base64url(signature);

    return `${data}.${encodedSignature}`;
}

// Server-side utility to create a video from an image
async function createVideoOnKlingAPI(videoOptions) {
    const headers = {
        Authorization: `Bearer ${await generateToken()}`,
        'Content-Type': 'application/json',
    };

    const response = await fetch(`${API_DOMAIN}/v1/videos/image2video`, {
        method: 'POST',
        headers,
        body: JSON.stringify(videoOptions),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`Kling API error: ${data.message || 'Unknown error'}`);
    }

    return data;
}

// Server-side utility to get account information
async function getAccountInfoFromKlingAPI(startTime, endTime, resourcePackName) {
    const params = new URLSearchParams();
    params.append('start_time', startTime);
    params.append('end_time', endTime);

    if (resourcePackName) {
        params.append('resource_pack_name', resourcePackName);
    }

    const headers = {
        Authorization: `Bearer ${await generateToken()}`,
        'Content-Type': 'application/json',
    };

    const response = await fetch(`${API_DOMAIN}/account/costs?${params.toString()}`, {
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`Kling API error: ${data.message || 'Unknown error'}`);
    }

    return data;
}

// Server-side utility to get task information
async function getTaskByIdFromKlingAPI(taskId) {
    const headers = {
        Authorization: `Bearer ${await generateToken()}`,
        'Content-Type': 'application/json',
    };

    const response = await fetch(`${API_DOMAIN}/v1/videos/image2video/${taskId}`, {
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`Kling API error (${response.status}): ${data.message || 'Unknown error'}`);
    }

    return data;
}

// Server-side utility to extend a video
async function extendVideoOnKlingAPI(videoId, extensionOptions = {}) {
    const headers = {
        Authorization: `Bearer ${await generateToken()}`,
        'Content-Type': 'application/json',
    };

    const payload = {
        video_id: videoId,
        ...extensionOptions,
    };

    const response = await fetch(`${API_DOMAIN}/v1/videos/video-extend`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`Kling API error: ${data.message || 'Unknown error'}`);
    }

    return data;
}

// Server-side utility to get extension task information
async function getExtensionTaskByIdFromKlingAPI(taskId) {
    const headers = {
        Authorization: `Bearer ${await generateToken()}`,
        'Content-Type': 'application/json',
    };

    const response = await fetch(`${API_DOMAIN}/v1/videos/video-extend/${taskId}`, {
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`Kling API error (${response.status}): ${data.message || 'Unknown error'}`);
    }

    return data;
}

// Server-side utility to list extension tasks
async function listExtensionTasksFromKlingAPI(pageNum = 1, pageSize = 30) {
    const params = new URLSearchParams();
    params.append('pageNum', pageNum.toString());
    params.append('pageSize', pageSize.toString());

    const headers = {
        Authorization: `Bearer ${await generateToken()}`,
        'Content-Type': 'application/json',
    };

    const response = await fetch(`${API_DOMAIN}/v1/videos/video-extend?${params.toString()}`, {
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`Kling API error: ${data.message || 'Unknown error'}`);
    }

    return data;
}

// Export server-side utilities
export const klingClient = {
    generateToken,
    createVideoOnKlingAPI,
    getAccountInfoFromKlingAPI,
    getTaskByIdFromKlingAPI,
    extendVideoOnKlingAPI,
    getExtensionTaskByIdFromKlingAPI,
    listExtensionTasksFromKlingAPI,
    ACCESS_KEY,
    SECRET_KEY,
    API_DOMAIN,
    TOKEN_EXPIRATION,
};
