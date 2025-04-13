const { Client, GatewayIntentBits } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.find(ch => ch.name === 'welcome↯');
  if (!channel) return;

  const canvas = createCanvas(800, 800);
  const ctx = canvas.getContext('2d');

  // 🖼️ الخلفية
  const background = await loadImage(path.join(__dirname, 'welcome-background.png'));
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // 🟢 رسم صورة البروفايل داخل دائرة
  const centerX = 260;
  const centerY = 390;
  const radius = 115;
  const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png' }));

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(avatar, centerX - radius, centerY - radius, radius * 2, radius * 2);
  ctx.restore();

  // ✅ بدون أي نص إضافي داخل الصورة

  const buffer = canvas.toBuffer('image/png');
  const filePath = path.join(__dirname, 'welcome-image.png');
  fs.writeFileSync(filePath, buffer);

  // ✉️ إرسال الترحيب بصورة واحدة فقط
  await channel.send({
    content: `! @${member.user.username}  أهلاً وسهلاً فيك ✨`,
    files: [filePath]
  });

  fs.unlinkSync(filePath);
});

client.login(process.env.TOKEN);
