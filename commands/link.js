const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function isValidSteamID64(steamId) {
    return /^7656[0-9]{13}$/.test(steamId);
}

module.exports = {
    data: new SlashCommandBuilder()

        .setName('link')
        .setDescription('Link your Steam ID')
        .addStringOption(option =>
            option.setName('steamid')
                .setDescription('Your Steam ID')
                .setRequired(true)),

    async execute(interaction, keyv) {
        const steamId = interaction.options.getString('steamid');
        const discordId = interaction.user.id;
        if(!isValidSteamID64(steamId)){
            await interaction.reply({ content: `The provided steam id (${steamId}) is invalid. Try again with a valid one.`, ephemeral: true});
            return;
        }
        await keyv.set(discordId, steamId);
        await interaction.reply({ content: `Your Steam ID (${steamId}) has been linked with your Discord account.`, ephemeral: true});
    },
};