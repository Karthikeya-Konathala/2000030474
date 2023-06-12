const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 8008;

async function fetchNumbers(url) {
    try {
      const response = await axios.get(url, { timeout: 500 });
      console.log(`Response from ${url}:`, response.data);
  
      if (response.data && Array.isArray(response.data.numbers)) {
        return response.data.numbers;
      }
  
      console.log(`Invalid response from ${url}. Missing numbers property or invalid JSON structure.`);
      return [];
    } catch (error) {
      console.error(`Error from ${url}:`, error);
      return [];
    }
  }
  

app.get('/numbers', async (req, res) => {
  try {
    const urls = req.query.url;
    if (!urls) {
      return res.status(400).json({ error: 'No URLs provided' });
    }

    const urlList = Array.isArray(urls) ? urls : [urls];

    const responses = await Promise.allSettled(urlList.map(fetchNumbers));

    const validResponses = responses
      .filter((response) => response.status === 'fulfilled' && response.value !== null)
      .map((response) => response.value)
      .flat()
      .filter((number) => typeof number === 'number');

    const mergedNumbers = [...new Set(validResponses)].sort((a, b) => a - b);

    return res.json({ numbers: mergedNumbers });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
