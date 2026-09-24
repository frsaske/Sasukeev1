async function dpCommand(sock, chatId, message) {
  const quoted = message.message?.extendedTextMessage?.contextInfo;
  const target = quoted?.participant || quoted?.remoteJid || message.key.participant || message.key.remoteJid;
  try {
    const url = await sock.profilePictureUrl(target, 'image');
    return sock.sendMessage(chatId, { image: { url }, caption: `📸 DP: @${target.split('@')[0]}`, mentions: [target] }, { quoted: message });
  } catch (_) {
    return sock.sendMessage(chatId, { text: '❌ Is user ki DP available nahi hai.' }, { quoted: message });
  }
}
module.exports = dpCommand;
