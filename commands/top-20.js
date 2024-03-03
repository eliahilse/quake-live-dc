const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');


async function get_player_page(mode, pageNum)
{
    const respose = await fetch(`${process.env.BASE_URL}/ratings/${mode}/${pageNum}.json`)
    return await respose.json()
}


module.exports = {
    data: new SlashCommandBuilder()
        .setName('top20')
        .setDescription('Top 20 on the Leaderboard'),
    async execute(interaction, keyv) {
        let data = await get_player_page("ca",0)
        let steamId = await keyv.get(interaction.user.id);
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Leaderboard CA')
        data.response.forEach((player, index)=> {
            let field_name = `${index + 1}. ${player.name}`;
            if(steamId != null && player._id === steamId){
                field_name = `${index + 1}. :arrow_right: You (${player.name})`;
            }
            embed.addFields({
                name: field_name,
                value: `**R:** ${Math.round(player.rating * 60)} **G:** ${player.n} **WR:** ${player.win_ratio}%`
            })
        });

        await interaction.reply({ embeds: [embed] });
    },
};
