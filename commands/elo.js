const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('elo')
        .setDescription('View your Elo, games, and win rate'),

    async execute(interaction, keyv) {
        // Retrieve the user's linked Steam ID from the key-value store
        const steamId = await keyv.get(interaction.user.id);

        // Check if the user has linked their Steam ID
        if (!steamId) {
            await interaction.reply({ content: 'You have not linked your Steam ID. Use `/link` to link your Steam ID first.', ephemeral: true });
            return;
        }

        try {
            // Fetch the user's stats from the provided API endpoint
            const response = await fetch(`${process.env.BASE_URL}/player/${steamId}.json`);
            const data = await response.json();

            // Extract the stats from the response
            const playerInfo = data.response;
            const playerName = playerInfo.name;
            const ratings = playerInfo.ratings.find(rating => rating.gametype_short === 'ca');
            const matches = playerInfo.matches.slice(0, 5); // Slice the array to get only the past 5 matches

            // Check if the user has stats for Clan Arena
            if (!ratings) {
                await interaction.reply({ content: 'No stats data available for Clan Arena.', ephemeral: true });
                return;
            }

            // Extracting relevant information
            const eloValue = Math.round(ratings.rating * 60);
            const gamesPlayed = ratings.n;

            // Construct the embed with the user's stats and past matches
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`${playerName}'s Stats`)
                .addFields(
                    { name: 'Elo', value: eloValue.toString() },
                    { name: 'Games Played', value: gamesPlayed.toString() },
                    { name: 'Recent Matches', value: matches.map(match => {
                        const emoji = match.result === 'Win' ? ':green_circle:' : ':red_circle:';
                        return `${emoji} ${match.result} - ${match.map}`;
                    }).join('\n') }
                    // Add more fields for other stats as needed
                );

            // Reply with the embed containing the user's stats
            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error fetching stats:', error);
            await interaction.reply({ content: 'An error occurred while fetching your stats.', ephemeral: true });
        }
    },
};
