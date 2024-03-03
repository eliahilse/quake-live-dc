require('dotenv').config()
const fs = require('node:fs');
const path = require('node:path');
const Keyv = require('keyv');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

// Discord Bot Setup
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Key-Value Storage
const keyv = new Keyv('sqlite://db/main.sqlite');

// Import commands from ./commands
const foldersPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(foldersPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction, keyv);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

client.once(Events.ClientReady, readyClient => {
    console.log('Logged in to Discord.');
});

client.login(process.env.DC_TK);