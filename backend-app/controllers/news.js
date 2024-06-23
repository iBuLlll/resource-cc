const axios = require('axios');
const cheerio = require('cheerio');

const baseurl = 'Fill with your link Artikel';
const baseurlPrefix = 'Fill with your link Artikel';

async function getNews(req, res) {
    try {
        const response = await axios.get(baseurl);
        const $ = cheerio.load(response.data);

        const news_data = [];

        const news = $("article");
        news.each(function () {
            let thumbnail = $(this).find("img").attr("src");
            if (thumbnail && !thumbnail.startsWith('http')) {
                thumbnail = baseurlPrefix + thumbnail; // Menambahkan URL awalan jika thumbnail bukan URL absolut
            }
            const title = $(this).find("h3").text();
            let link = $(this).find("a").attr("href");
            if (link && !link.startsWith('http')) {
                link = baseurlPrefix + link; // Menambahkan URL awalan jika link bukan URL absolut
            }

            news_data.push({ thumbnail, title, link });
        });

        res.json(news_data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
}

module.exports = {
    getNews
};
