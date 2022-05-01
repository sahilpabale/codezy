const wait = require("node:timers/promises").setTimeout;
const {
  MessageActionRow,
  MessageEmbed,
  MessageSelectMenu,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("exec")
    .setDescription("Execute the code."),
  async execute(interaction) {
    const row = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("lang")
        .setPlaceholder("Select language")
        .addOptions([
          {
            label: "Python",
            description: "run python code",
            value: "116",
          },
          {
            label: "Java",
            description: "run java code",
            value: "10",
          },
          {
            label: "Javascript",
            description: "run javascript code",
            value: "35",
          },
          {
            label: "C",
            description: "run c code",
            value: "11",
          },
          {
            label: "C++",
            description: "run c++ code",
            value: "44",
          },
          {
            label: "Node.js",
            description: "run node.js code",
            value: "56",
          },
          {
            label: "Golang",
            description: "run golang code",
            value: "114",
          },
        ]),
    );

    const embed = new MessageEmbed()
      .setTitle("Execute your code!")
      .setColor("AQUA")
      .setDescription(
        "Select your progamming language and just give us the code. We serve you the output :D",
      );

    await interaction.reply({
      ephemeral: true,
      embeds: [embed],
      components: [row],
    });
  },
};
