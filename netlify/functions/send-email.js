exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // HARDCODED TEMPORAL PARA PRUEBA
    const BREVO_API_KEY = 'xsmtpsib-30df57f01c6a72b040d0b791acc7c39892509ecea4b8a5632823063b5d53dd44-' + 'JOLFu3wA6WEHu8FN';
    console.log("==== DEBUG INFO ====");
    console.log("Is BREVO_API_KEY undefined?", typeof BREVO_API_KEY === 'undefined');
    console.log("API Key starts with:", BREVO_API_KEY ? BREVO_API_KEY.substring(0, 5) : "NULL");
    console.log("====================");
    const TEMPLATE_IDS = {
        'Eficiencia Sostenible': 5,
        'Rendimiento bajo Alarma': 6,
        'Fuga Crítica de Energía': 7
    };

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (e) {
        return { statusCode: 400, body: 'Invalid JSON' };
    }

    const { nombre, email, perfil } = body;

    if (!nombre || !email || !perfil) {
        return { statusCode: 400, body: 'Faltan datos' };
    }

    const templateId = TEMPLATE_IDS[perfil];
    if (!templateId) {
        return { statusCode: 400, body: 'Perfil no válido' };
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                templateId: templateId,
                to: [{ email: email, name: nombre }],
                params: { NOMBRE: nombre }
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('Brevo error:', result);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: result })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, messageId: result.messageId })
        };

    } catch (err) {
        console.error('Error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
