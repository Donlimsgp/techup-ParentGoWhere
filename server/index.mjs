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

// Helper function to get OAuth token for SkillsFuture API
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

// Updated route to get coordinates and street name
app.get('/get-coordinates', async (req, res) => {
    const postalCode = req.query.postalCode;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!postalCode || !apiKey) {
        return res.status(400).json({ error: 'Postal code or API key is missing' });
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${postalCode}&components=postal_code:${postalCode}|country:SG&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "OK") {
            throw new Error(data.error_message || 'Failed to fetch coordinates');
        }

        const location = data.results[0].geometry.location;
        let streetName = '';

        // Extract street name from address components
        const addressComponents = data.results[0].address_components;
        for (const component of addressComponents) {
            // Look for the route (street name) component
            if (component.types.includes('route')) {
                streetName = component.long_name;
                break;
            }
        }

        // If no street name found, try to get the neighborhood or sublocality
        if (!streetName) {
            for (const component of addressComponents) {
                if (component.types.includes('neighborhood') || 
                    component.types.includes('sublocality_level_1')) {
                    streetName = component.long_name;
                    break;
                }
            }
        }

        // If still no street name found, try premise or establishment
        if (!streetName) {
            for (const component of addressComponents) {
                if (component.types.includes('premise') || 
                    component.types.includes('establishment') ||
                    component.types.includes('sublocality_level_2')) {
                    streetName = component.long_name;
                    break;
                }
            }
        }

        // If still nothing found, use the first part of the formatted address
        if (!streetName && data.results[0].formatted_address) {
            streetName = data.results[0].formatted_address.split(',')[0];
        }

        // Clean up the street name
        streetName = streetName
            .replace(/Singapore/g, '')
            .replace(/\d{6}/, '')
            .trim();

        // Return both coordinates and street name
        res.json({
            ...location,
            address: streetName || 'Singapore'
        });
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        res.status(500).json({ error: 'Failed to fetch coordinates' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});