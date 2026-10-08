const fs = require('fs');

const data = JSON.parse(fs.readFileSync('../data/frejer.json', 'utf8'));

// Extract games with their success rate
const games = [];
data.forEach(topic => {
    if (topic.wariant === 'A' && topic.pytanie) {
        const titleMatch = topic.pytanie.match(/[„"'](.*?)[”"']/);
        if (titleMatch) {
            const gameIdMatch = topic.id_slug.match(/^(playbook-chap\d+-play\d+)/);
            if (gameIdMatch && topic.stats_json && topic.stats_json.success_rate) {
                if (!games.find(g => g.id === gameIdMatch[1])) {
                    games.push({ 
                        id: gameIdMatch[1], 
                        title: titleMatch[1],
                        successRate: topic.stats_json.success_rate
                    });
                }
            }
        }
    }
});

const files = fs.readdirSync('images').filter(f => f.endsWith('.txt'));

games.forEach(game => {
    let statsPage = -1;
    // Find page with the exact success rate string
    for (const file of files) {
        const text = fs.readFileSync(`images/${file}`, 'utf8');
        if (text.includes(game.successRate)) {
            statsPage = parseInt(file.match(/\d+/)[0], 10);
            break;
        }
    }

    if (statsPage !== -1) {
        // Assume the first page of the game is either the stats page itself,
        // or the page immediately preceding it if it's a 2-page game.
        // We will just print them and I will manually define the exact mapping in the plan.
        console.log(`${game.id} (${game.title}) -> Stats on page ${statsPage}`);
    } else {
        console.log(`WARN: Could not find stats for ${game.title} (Rate: ${game.successRate})`);
    }
});



