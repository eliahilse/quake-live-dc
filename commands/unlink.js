const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlink')
        .setDescription('Unlink your Steam ID'),
    async execute(interaction, keyv) {
        const discordId = interaction.user.id;

        const linkedSteamId = await keyv.get(discordId);
        if (!linkedSteamId) {
            await interaction.reply('No Steam ID linked with your Discord account.');
            return;
        }
        await keyv.delete(discordId);
        await interaction.reply('Your Steam ID has been unlinked from your Discord account.');
    },
};