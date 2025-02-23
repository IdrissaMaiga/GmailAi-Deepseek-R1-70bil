import { google } from "googleapis";
import { cookies } from "next/headers";

//let's exchange the code for an access token
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);
export default oauth2Client;

export async function verifyAndRefreshToken() {
    const cookieStore = cookies();
    const storedToken = cookieStore.get("google_access_token")?.value;

    if (!storedToken) {
        return { error: "No access token found", status: 401 };
    }

    const parsedToken = JSON.parse(storedToken);
    let { token: accessToken, refresh_token: refreshToken } = parsedToken;

    try {
        // Check if access token is valid
        const res = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
        if (res.ok) {
            console.log("Access token is valid.");
            return { accessToken };
        }
    } catch (error) {
        console.error("Error validating access token:", error);
    }

    // If token is invalid, refresh it
    if (!refreshToken) {
        return { error: "No refresh token available", status: 401 };
    }

    try {
        console.log("Refreshing access token...");
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        // Save new token in cookies
        cookies().set('google_access_token', JSON.stringify({
            token: credentials.access_token,
            refresh_token: refreshToken, // Keep the same refresh token
        }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 1 week
        });

        console.log("New access token saved.");
        return { accessToken: credentials.access_token };
    } catch (error) {
        console.error("Failed to refresh access token:", error);
        return { error: "Failed to refresh token", status: 401 };
    }
}