const axios = require('axios');

const WAIFU_API = 'https://api.waifu.im/images';

const TAG_CONFIG = {
  // SFW Tags & Keywords
  'waifu': { tag: 'waifu', nsfw: false, label: 'Waifu' },
  'maid': { tag: 'maid', nsfw: false, label: 'Maid' },
  'uniform': { tag: 'uniform', nsfw: false, label: 'Uniform' },
  'cosplay': { tag: 'uniform', nsfw: false, label: 'Cosplay' },
  'selfie': { tag: 'selfies', nsfw: false, label: 'Selfie' },
  'selfies': { tag: 'selfies', nsfw: false, label: 'Selfies' },
  'marin': { tag: 'marin-kitagawa', nsfw: false, label: 'Marin Kitagawa' },
  'marinkitagawa': { tag: 'marin-kitagawa', nsfw: false, label: 'Marin Kitagawa' },
  'marin-kitagawa': { tag: 'marin-kitagawa', nsfw: false, label: 'Marin Kitagawa' },
  'mori': { tag: 'mori-calliope', nsfw: false, label: 'Mori Calliope' },
  'moricalliope': { tag: 'mori-calliope', nsfw: false, label: 'Mori Calliope' },
  'mori-calliope': { tag: 'mori-calliope', nsfw: false, label: 'Mori Calliope' },
  'raiden': { tag: 'raiden-shogun', nsfw: false, label: 'Raiden Shogun' },
  'raidenshogun': { tag: 'raiden-shogun', nsfw: false, label: 'Raiden Shogun' },
  'raiden-shogun': { tag: 'raiden-shogun', nsfw: false, label: 'Raiden Shogun' },
  'ayaka': { tag: 'kamisato-ayaka', nsfw: false, label: 'Kamisato Ayaka' },
  'kamisato': { tag: 'kamisato-ayaka', nsfw: false, label: 'Kamisato Ayaka' },
  'kamisatoayaka': { tag: 'kamisato-ayaka', nsfw: false, label: 'Kamisato Ayaka' },
  'kamisato-ayaka': { tag: 'kamisato-ayaka', nsfw: false, label: 'Kamisato Ayaka' },
  'rem': { tag: 'rem', nsfw: false, label: 'Rem' },
  'genshin': { tag: 'genshin-impact', nsfw: false, label: 'Genshin Impact' },
  'genshinimpact': { tag: 'genshin-impact', nsfw: false, label: 'Genshin Impact' },
  'genshin-impact': { tag: 'genshin-impact', nsfw: false, label: 'Genshin Impact' },
  'oppai': { tag: 'oppai', nsfw: 'All', label: 'Oppai' },
  'onepiece': { tag: 'one-piece', nsfw: 'All', label: 'One Piece' },
  'one-piece': { tag: 'one-piece', nsfw: 'All', label: 'One Piece' },

  // NSFW Tags & Keywords
  'nsfw': { tag: null, nsfw: true, label: 'NSFW Waifu' },
  'nswf': { tag: null, nsfw: true, label: 'NSFW Waifu' },
  'ero': { tag: 'ero', nsfw: true, label: 'Ero' },
  'ecchi': { tag: 'ecchi', nsfw: true, label: 'Ecchi' },
  'hentai': { tag: 'hentai', nsfw: true, label: 'Hentai' },
  'milf': { tag: 'milf', nsfw: true, label: 'MILF' },
  'ass': { tag: 'ass', nsfw: true, label: 'Ass' },
  'paizuri': { tag: 'paizuri', nsfw: true, label: 'Paizuri' },
  'oral': { tag: 'oral', nsfw: true, label: 'Oral' },
  'nami': { tag: 'nami', nsfw: true, label: 'Nami' }
};

function getCategoryConfig(keyword) {
  if (!keyword) return null;
  const key = keyword.toLowerCase().trim().replace(/^[./]/, '');
  return TAG_CONFIG[key] || null;
}

function buildCaption(imageItem, requestedLabel, isNsfw) {
  let tagList = '';
  if (Array.isArray(imageItem.tags) && imageItem.tags.length > 0) {
    tagList = imageItem.tags.map(t => t.name).filter(Boolean).join(', ');
  }

  const categoryName = requestedLabel || (tagList ? tagList.split(',')[0] : 'Waifu');
  const ratingText = isNsfw || imageItem.isNsfw ? '🔞 18+ (NSFW)' : '🟢 SFW';

  let caption = `╭───「 ⚡ *ꜱᴀꜱᴜᴋᴇ-𝐗* ⚡ 」───╮\n`;
  caption += `│ 🏷️ *Category:* ${categoryName}\n`;
  if (tagList) {
    caption += `│ ✦ *Tags:* ${tagList}\n`;
  }
  caption += `│ 🔰 *Rating:* ${ratingText}\n`;
  caption += `╰─────────────────────────┈⊷\n`;
  caption += `> ⚡ ᴡᴀᴛᴇʀᴍᴀʀᴋ: ꜱᴀꜱᴜᴋᴇ-𝐗`;

  return caption;
}

async function fetchWaifuData(config) {
  const params = {};

  if (config.tag) {
    params.IncludedTags = [config.tag];
  }

  if (config.nsfw === true) {
    params.IsNsfw = 'True';
  } else if (config.nsfw === 'All') {
    params.IsNsfw = 'All';
  } else {
    params.IsNsfw = 'False';
  }

  const response = await axios.get(WAIFU_API, {
    params,
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  const items = response.data?.items;
  if (!items || items.length === 0) {
    throw new Error('No images found for this category');
  }

  return items[0];
}

async function sendWaifuImage(sock, chatId, message, config, fallbackLabel) {
  try {
    const item = await fetchWaifuData(config);
    const imageUrl = item.url;
    const caption = buildCaption(item, config.label || fallbackLabel, config.nsfw === true || item.isNsfw);

    // Download image buffer for fast and reliable sending
    let mediaPayload;
    try {
      const imgRes = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 15000
      });
      mediaPayload = { image: Buffer.from(imgRes.data), caption };
    } catch (_) {
      // Fallback directly to URL if buffer download fails
      mediaPayload = { image: { url: imageUrl }, caption };
    }

    await sock.sendMessage(chatId, mediaPayload, { quoted: message });
  } catch (error) {
    console.error('Error in sendWaifuImage:', error.message || error);
    await sock.sendMessage(
      chatId,
      { text: `❌ Failed to fetch image. Please try again.` },
      { quoted: message }
    );
  }
}

function getHelpText() {
  return `╭───「 ⚡ *ꜱᴀꜱᴜᴋᴇ-𝐗 ᴡᴀɪғᴜ ɢᴀʟʟᴇʀʏ* ⚡ 」───╮
│
│ 🌸 *SFW Commands:*
│ • .waifu         ➔ Random Waifu
│ • .maid          ➔ Maid Uniform
│ • .uniform       ➔ Uniform / Cosplay
│ • .selfie        ➔ Waifu Selfies
│ • .marin         ➔ Marin Kitagawa
│ • .raiden        ➔ Raiden Shogun
│ • .ayaka         ➔ Kamisato Ayaka
│ • .rem           ➔ Rem (Re:Zero)
│ • .oppai         ➔ Oppai
│ • .genshin       ➔ Genshin Impact
│ • .onepiece      ➔ One Piece
│
│ 🔞 *NSFW Commands:*
│ • .nsfw / .nswf  ➔ Random NSFW
│ • .hentai        ➔ Hentai
│ • .ecchi         ➔ Ecchi
│ • .ero           ➔ Erotic
│ • .milf          ➔ MILF
│ • .ass           ➔ Ass
│ • .paizuri       ➔ Paizuri
│ • .oral          ➔ Oral
│ • .nami          ➔ Nami (NSFW)
│
│ 💡 *Tip:* You can also use:
│   .waifu <category> (e.g. .waifu maid)
│
╰──────────────────────────────┈⊷
> ⚡ ᴡᴀᴛᴇʀᴍᴀʀᴋ: ꜱᴀꜱᴜᴋᴇ-𝐗`;
}

async function waifuCommand(sock, chatId, message, args = [], forcedCategory = null) {
  const sub = (args[0] || '').toLowerCase().trim();

  // Help / List command
  if (sub === 'help' || sub === 'list' || sub === 'tags' || sub === 'categories') {
    await sock.sendMessage(chatId, { text: getHelpText() }, { quoted: message });
    return;
  }

  // Determine configuration
  let config = null;
  let label = null;

  if (forcedCategory) {
    config = getCategoryConfig(forcedCategory);
    label = config ? config.label : forcedCategory;
  } else if (sub) {
    config = getCategoryConfig(sub);
    label = config ? config.label : sub;
    if (!config) {
      await sock.sendMessage(
        chatId,
        {
          text: `❌ Unknown category: *${sub}*\n\nType *.waifu list* to see all available SFW & NSFW categories.`
        },
        { quoted: message }
      );
      return;
    }
  } else {
    // Default .waifu command -> random waifu SFW
    config = TAG_CONFIG['waifu'];
    label = 'Waifu';
  }

  if (!config) {
    config = { tag: 'waifu', nsfw: false, label: 'Waifu' };
  }

  await sendWaifuImage(sock, chatId, message, config, label);
}

module.exports = {
  waifuCommand,
  sendWaifuImage,
  getCategoryConfig,
  getHelpText,
  TAG_CONFIG
};
