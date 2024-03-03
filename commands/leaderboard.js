const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const {pagination, ButtonTypes, ButtonStyles} = require('@devraelfreeze/discordjs-pagination');

async function get_player_page(mode, pageNum)
{
    const respose = await fetch(`${process.env.BASE_URL}/ratings/${mode}/${pageNum}.json`)
    return await respose.json()
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('lbfull')
        .setDescription('Leaderboard'),

    async execute(interaction, keyv) {
        await interaction.deferReply();
        let steamId = await keyv.get(interaction.user.id);
        let arrayEmbeds = [];
        let pageNum = 0;
        let match = null;

        while (true) {
            let data = await get_player_page("ca", pageNum);
            if (data.response.length === 0) break;
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Leaderboard CA - Page ${pageNum + 1}`);

            data.response.forEach( (player, index) => {
                let field_name = `${index + 1}. ${player.name}`;
                if (steamId != null && player._id === steamId) {
                    field_name = `${index + 1}. :arrow_right: You (${player.name})`;
                }
                // **G:** ${player.n}
                embed.addFields({
                    name: field_name,
                    value: `**ELO:** ${Math.round(player.rating * 60)} **WR:** ${player.win_ratio}%`
                });
            });

            arrayEmbeds.push(embed);
            pageNum++;
        }

        await pagination({
            embeds: arrayEmbeds,
            author: interaction.member.user,
            interaction: interaction,
            ephemeral: true,
            time: 600000,
            disableButtons: true,
            fastSkip: false,
            pageTravel: false,
            buttons: [
                {
                    type: ButtonTypes.previous,
                    label: 'Previous Page',
                    style: ButtonStyles.Primary
                },
                {
                    type: ButtonTypes.next,
                    label: 'Next Page',
                    style: ButtonStyles.Success
                }
            ]
        });
    },
};
