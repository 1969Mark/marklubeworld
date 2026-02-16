const handler = require('./api/chat.js');

async function test() {
    const req = {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: { message: 'hello', history: [] }
    };
    const res = {
        status: function(code) { 
            console.log('Status set to:', code); 
            return this; 
        },
        json: function(data) { 
            console.log('JSON Response:', JSON.stringify(data, null, 2)); 
            return this; 
        },
        setHeader: function(k, v) { console.log('Header set:', k, '=', v); },
        end: function() { console.log('Response ended'); }
    };

    console.log('Starting handler test...');
    try {
        await handler(req, res);
    } catch (e) {
        console.error('Fatal test error:', e);
    }
}

test();
