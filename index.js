const { Client, GatewayIntentBits } = require('discord.js')
const db = require('./database');


const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const TOKEN = 'TOKEN_KEY';

//Specific message pattern to match
const SCAM_MESSAGE_PATTERN = /Hi everyone! I'm looking to sell my tickets to Olivia Rodrigo concert at The Kia Forum-Inglewood,CA\nWed , Aug 14 2024-7:30\nHMU if you're interested \(209\) 528-8255/i;
const USERNAME_CHANGE_LIMIT = 3;

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', message => {
    console.log('Bot is online!');
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    if (SCAM_MESSAGE_PATTERN.test(message.content)) {
        const userId = message.author.id;
        const username = message.author.username;

        db.get('SELECT usernames FROM users WHERE user_id = ?', [userId], (err, row) => {
            if (err) {
                console.error('Database error: ', err);
            }

            if (row) {
                const usernames = row.usernames.split(',');
                if (!usernames.includes(username)) {
                    usernames.push(username);
                }

                if (usernames.length > USERNAME_CHANGE_LIMIT) {
                    message.guild.members.ban(userId, { reason: 'Multiple username changes with scam messages detected' })
                    .then(() => {
                        console.log(`Banned ${message.author.tag} for scam messages`);
                        db.run('DELETE FROM users WHERE user_id = ?', [userId]);
                        
                    })
                    .catch(err => {
                        console.error('Failed to ban member', err);
                    });
                } else {
                    db.run('UPDATE users SET usernames = ? WHERE user_id = ?', [username.join(','), userId]);
                }
            } else {
                db.run('INSERT INTO users (user_id, usernames) VALUES (?, ?)', [userId, username]);
            }
        });
    }
});

client.login(TOKEN);