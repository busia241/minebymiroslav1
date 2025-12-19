export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    const targetUrl = 'https://rgs.stake-engine.com/play';
    
    fetch(targetUrl, {
        method: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body)
    })
    .then(response => response.json())
    .then(data => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(500).json({ error: err.message });
    });
}

