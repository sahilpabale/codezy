// Require the necessary discord.js classes
const wait = require("node:timers/promises").setTimeout;
const fs = require("node:fs");
const { Client, Collection, Intents, MessageEmbed } = require("discord.js");
const config = require("./config");
const { default: axios } = require("axios");
require("dotenv").config();

const TOKEN = process.env.TOKEN;

// Create a new client instance
const client = new Client({
  partials: ["CHANNEL"],
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING,
  ],
});

const eventFiles = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.commands = new Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  client.commands.set(command.data.name, command);
}

let currUserId;
let selection;
let submissionID;

const access_token = process.env.CODE_TOKEN;
const endpoint = process.env.API;

const submitCode = async (code, userId, msg) => {
  try {
    let submissionData = {
      compilerId: selection,
      source: code,
    };

    const resp = await axios.post(
      `${endpoint}/submissions?access_token=${access_token}`,
      submissionData,
    );

    submissionID = resp.data.id;

    await wait(2000);

    let execution = await axios.get(
      `${endpoint}/submissions/${submissionID}?access_token=${access_token}`,
    );

    while (execution.data.executing) {
      await wait(2000);

      execution = await axios.get(
        `${endpoint}/submissions/${submissionID}?access_token=${access_token}`,
      );
    }

    await wait(2000);

    const output = await axios.get(
      `${endpoint}/submissions/${submissionID}/output?access_token=${access_token}`,
    );
    const embed = new MessageEmbed()
      .setTitle("Successfully executed!")
      .setColor("GREEN")
      .addFields({ name: "Output", value: output.data });
    const user = await client.users.fetch(userId);
    await user.send({ embeds: [embed] });

    selection = null;
  } catch (error) {
    console.log(error);
    if (error.response.status === 404) {
      const err = await axios.get(
        `${endpoint}/submissions/${submissionID}/error?access_token=${access_token}`,
      );

      const embed = new MessageEmbed()
        .setTitle("Error!")
        .setColor("RED")
        .addFields({ name: "Message", value: err.data });
      const user = await client.users.fetch(userId);
      await user.send({ embeds: [embed] });
    } else if (error.response.data.error_code === 1101) {
      const embed = new MessageEmbed()
        .setTitle("Error!")
        .setColor("RED")
        .addFields({ name: "Message", value: "Ma chudao" });
      const user = await client.users.fetch(userId);
      await user.send({ embeds: [embed] });
    }
  }
};

// listen to DM msgs
client.on("messageCreate", async (msg) => {
  if (!msg.channel.type === "DM" || msg.author.bot) return;
  if (msg.author.id === currUserId) {
    // const code = fs.readFileSync("./app.py", { encoding: "utf-8" });
    // let code = msg.content.replace(/[\r\n]+/g, "\\n");
    // code = code.replace(/\s\s\s\s/g, "\\t");
    const code = msg.content;

    await submitCode(code, currUserId, msg);

    currUserId = null;
  }
});

// select menu interaction
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isSelectMenu()) return;

  if (interaction.customId === "lang") {
    await interaction.deferUpdate();
    await wait(500);

    selection = parseInt(interaction.values[0]);
    const lang = config[parseInt(interaction.values[0])];

    const embed = new MessageEmbed()
      .setTitle("Please submit your code here")
      .setColor("AQUA")
      .setDescription(
        "Please use 4 spaces for indentation and don't use ` or ``` to submit code!",
      );

    const user = await client.users.fetch(interaction.user.id);
    await user.send({ embeds: [embed] });

    currUserId = user.id;

    await interaction.followUp({
      content: `<@${interaction.user.id}> **check your DM to submit ${lang} code and get result.**`,
      ephemeral: true,
    });
  }
});

// Login to Discord with your client's token
client.login(TOKEN);
