const settings = require('../settings');

async function backupCommand(sock, chatId, message) {
  try {
    const devUrl = 'https://ais-dev-jwcxdlabyfzetgy2n36zgf-245889155456.asia-east1.run.app';

    const text = `╭━━━〔 ☁️ ɢᴏᴏɢʟᴇ ᴅʀɪᴠᴇ & ʙᴀᴄᴋᴜᴘ 〕━━━╮
┃
┃ 📦 *SasukeX Codebase Backup*
┃
┃ You can upload your complete bot code
┃ directly to *Google Drive* or download
┃ the ZIP archive via your dashboard:
┃
┃ 🌐 *Web Dashboard & Drive Uploader:*
┃ ${devUrl}
┃
┃ 💡 *Instructions:*
┃ 1. Open the dashboard link above.
┃ 2. Click *Sign in with Google*.
┃ 3. Click *Upload Codebase to Google Drive*.
┃
┃ 📂 The code archive will be safely saved
┃ to your Google Drive account!
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

    await sock.sendMessage(chatId, { text }, { quoted: message });
  } catch (error) {
    console.error('Error in backupCommand:', error);
    await sock.sendMessage(chatId, { text: '❌ Failed to process backup command.' }, { quoted: message });
  }
}

module.exports = { backupCommand };
