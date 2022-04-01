const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!")
    .addStringOption((option) => {
      return option
        .setName("first")
        .setDescription("First name of user")
        .setRequired(true);
    })
    .addStringOption((option) => {
      return option
        .setName("last")
        .setDescription("Last name of user")
        .setRequired(true);
    }),
  async execute(interaction) {
    const firstName = interaction.options.getString("first");
    const lastName = interaction.options.getString("last");
    await interaction.reply(`Pong ${firstName} ${lastName}`);
  },
};
