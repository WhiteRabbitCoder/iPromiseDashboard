const axios = require('axios');

exports.handler = async (event, context) => {
    const { conversation_id } = event.queryStringParameters;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!conversation_id) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing conversation_id" }),
        };
    }

    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "ELEVENLABS_API_KEY not configured in environment" }),
        };
    }

    try {
        const response = await axios({
            method: 'get',
            url: `https://api.elevenlabs.io/v1/convai/conversations/${conversation_id}/audio`,
            headers: {
                'xi-api-key': apiKey,
            },
            responseType: 'arraybuffer',
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Disposition': `attachment; filename="call-${conversation_id}.mp3"`
            },
            body: Buffer.from(response.data).toString('base64'),
            isBase64Encoded: true,
        };
    } catch (error) {
        console.error("Error fetching audio from ElevenLabs:", error.response?.data?.toString() || error.message);
        return {
            statusCode: error.response?.status || 500,
            body: JSON.stringify({ error: "Failed to fetch audio from ElevenLabs" }),
        };
    }
};
