import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fetch from 'node-fetch';

dotenv.config();
const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.static(path.join(process.cwd(), 'public')));

// Endpoint to provide Google Maps API Key to client-side
app.get('/api-key', (req, res) => {
    res.json({ apiKey: process.env.GOOGLE_MAPS_API_KEY });
});

// Function to retrieve OAuth 2.0 access token
async function getAccessToken() {
    const tokenUrl = 'https://api.ssg-wsg.gov.sg/oauth2/token';
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`Failed to fetch access token: ${data.error_description || data.error}`);
    }

    return data.access_token;
}

// Endpoint to fetch specific course details from SkillsFuture API using course ID
app.get('/course-details', async (req, res) => {
    const courseId = req.query.courseId; // Get courseId from query parameter
    if (!courseId) {
        return res.status(400).json({ error: 'Course ID is required' });
    }

    try {
        const accessToken = await getAccessToken();
        const apiUrl = `https://public-api.ssg-wsg.sg/courses/directory/${courseId}?includeExpiredCourses=true`;

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching data from SkillsFuture API: ${response.statusText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching course details:', error);
        res.status(500).json({ error: 'Failed to fetch course details' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
