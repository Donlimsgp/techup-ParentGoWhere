import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.static(path.join(new URL('.', import.meta.url).pathname, '../public')));

// Helper function to get OAuth token
async function getOAuthToken() {
    const response = await fetch('https://public-api.ssg-wsg.sg/dp-oauth/oauth/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Failed to fetch OAuth token: ${data.error}`);
    }
    return data.access_token;
}

// Route to fetch course details by ID
app.get('/courses/:courseId', async (req, res) => {
    try {
        const token = await getOAuthToken();
        const courseId = req.params.courseId;
        const apiUrl = `https://public-api.ssg-wsg.sg/courses/directory/${courseId}?includeExpiredCourses=true`;

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching course data: ${response.statusText}`);
        }

        const courseData = await response.json();
        res.json(courseData);
    } catch (error) {
        console.error('Error fetching course data:', error);
        res.status(500).json({ error: 'Failed to fetch course data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
