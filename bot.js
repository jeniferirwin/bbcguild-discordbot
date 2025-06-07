import Eris from 'eris';
import axios from 'axios';
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();
const bot = new Eris(process.env.BOT_TOKEN);
const sheetURL = process.env.SHEET_URL;
const rankInfoURL = process.env.RANKINFO_URL;

const runBot = () => {
    bot.on("ready", () => {
        console.log("Ready!");
    });

    bot.on("messageCreate", async (msg) => {
        if (msg.content === "!ping") {
            await bot.createMessage(msg.channel.id, "Pong!");
        } else if (msg.content === "!update") {
            // check permissions
            await bot.createMessage(msg.channel.id, "Update started...");
            await resetCache();
            await bot.createMessage(msg.channel.id, "Update done");
        } else if (msg.content === "!rankinfo") {
            let reply = `I'm sending you a DM with the info, <@${msg.author.id}>!`;
            await bot.createMessage(msg.channel.id, reply);
            let target = await bot.getDMChannel(msg.author.id);
            //await bot.createMessage(target.id, "**BBC RANKINGS OVERVIEW:**\nOur rankings reports are updated weekly(ish) and are based on a rolling 30-Day History.\nEach update, an old week drops off and the latest week is added.\n\nThis report tracks all forms of contributions to the guild (and they all count equally), including the 3.5% cut the guild gets from your sales and purchases, raffle tickets, gold deposited to the bank and item donations from guild farming events or sent to our auction account.\n\n**RANKINGS DETERMINE MEMBER REMOVALS:**\nEach week, we make room for new members in the guild by removing the lowest contributing members.\nThose contributing less than 25% of their fair share over the past 30 days are at highest risk of removal.\n\n**NEW MEMBERS UNDER 30 DAYS:**\nWe won't have a full picture for you in this report until you've been a member for at least 30 days.\nThis is taken into consideration when we do our weekly purges.  For instance, if you've been in the guild for 10 days, we'll evaluate what tripling your activity looks like.\n\n**CHECKING YOUR RANK:**\nYou can use the BBC-Rankbot to check your rank in the #bbc-rankbot channel by typing !username (your ESO @name without the @ sign.)\n\nYou can check the full ranking reports for all members at:\n<https://bbcguild.com/ranks>\n\nBe sure to make note of the \"Last Updated\" date.\n\n**QUESTIONS OR CONCERNS:**\nIf there's something you don't understand, or if you think we've made a mistake with your contributions history, please reach out to @Hiyde!\n\n**THANK YOU FOR SUPPORTING THE BBC!**");
            let rankinfo = await getRankInfo();
            await bot.createMessage(target.id, rankinfo);
        } else if (msg.content.startsWith("!")) { // assumes every argument that gets here is a user
            let command = msg.content;
            let user = command.replace("!", "");
            
            await handleUser(user, msg);
        }
    });
    

    bot.on("error", (err) => {
        console.log(err);
    })
    
    bot.on("disconnect", () => {
        console.log("Disconnected. Don't panic, this is usually normal. Reconnecting...");
        bot.connect();
    })
    
    bot.connect();
}

let handleUser = async(user, msg) => {   
    // console.log(msg);
    let memberData;

    try {
        memberData = await getCachedMember(user);
    } catch (error) {
        memberData = await getUserDetails(user);
    }
    
    if (!("error" in memberData) || memberData.length ){
        memberData.map(async(member) => {
            await sendMemberEmbed(member, msg);
        });
    } else {
        await bot.createMessage(msg.channel.id, "User not found");
    }
}

let getEmoticon = (share_value) => {
    let share_number = share_value.replace(/\D/g, '');
    share_number = parseInt(share_number);
    let emoticon = '';

    if (share_number < 25) {
        emoticon = ':rotating_light:';
    }
    else if (share_number < 50) {
        emoticon = ':warning:';
    }
    else if (share_number < 75) {
        emoticon = ':bell:';
    }
    else if (share_number < 100) {
        emoticon = ':white_check_mark:';
    }
    else {
        emoticon = ':partying_face:';
    }

    return emoticon;
}

let sendMemberEmbed = async (member, msg) => {
    const converter = (val) =>  { var f = Intl.NumberFormat(); return f.format(val.toFixed(0)) };
    // console.log(member);
    const lastUpdated = new Date(member["timeupdated"] * 1000);
    const cpw = converter(member["weekly_cost"]);
    const cpm = converter(member["weekly_cost"] * 4.3);
    let share_value = member["monthly_share"];
    let emoticon = getEmoticon(share_value);


    await bot.createMessage(msg.channel.id, {
        embeds: [{
            title: `${ member.member }`,
            description: member.sheet_title,
            author: {
                name: msg.author.username,
                icon_url: msg.author.avatarURL
            },
            color: 0xFF6600,
            fields: [
                {
                    name: "Your Share of our Kiosk Bid:",
                    value: cpw + "g per week - " + cpm + "g per month",
                    inline: false
                },
                {
                    name: `${emoticon} You have contributed ${share_value} of your Fair Share for the past 30 days.`,
                    value: '',
                    inline: false
                },
                {
                    name: `Your Rank: ${member["rank"]}`,
                    value: '',
                    inline: false
                },
                
                {
                    name: "Contributions Breakdown:",
                    value: '',
                    inline: false
                },

                {
                    name: member["header1"],
                    value: converter(member["value1"]),
                    inline: true
                },
                {
                    name: member["header2"],
                    value: converter(member["value2"]) ,
                    inline: true
                },
                {
                    name: member["header3"],
                    value: converter(member["value3"]),
                    inline: true
                },
                {
                    name: member["header4"],
                    value: converter(member["value4"]),
                    inline: true
                },
                {
                    name: member["header5"],
                    value: converter(member["value5"]),
                    inline: true
                },
                {
                    name: '',
                    value: '',
                    inline: true
                },
                {
                    name: `Total Gold Contributed: ${converter(member["total_gold"])}`,
                    value: '',
                    inline: false
                },
                {
                    name: '',
                    value: `:calendar_spiral: Rankings last updated ${ lastUpdated.getMonth() + 1 }/${ lastUpdated.getDate() }/${ lastUpdated.getFullYear() }\n:warning:New Members won't have full info for 30 days\n:question:Type !rankinfo to learn how rankings work`,
                    inline: false
                }
            ],
            /*footer: {
                text: `:calendar_spiral: Rankings last updated ${ lastUpdated.getMonth() + 1 }/${ lastUpdated.getDate() }/${ lastUpdated.getFullYear() }\n:warning:New Members won't have full info for 30 days\n:question:Type !rankinfo to learn how rankings work`
            }*/
        }]
    });
}

let getCachedMember = async (member) => {

    let foo = await prisma.member.findMany({
        where: {
            member
        }
    })

    return foo
}

const getUserDetails = async (member) => {
    try {
        let response = await axios.get(encodeURI(sheetURL), 
        {
            params: {
                member
            }
        });

        return response.data
    } catch (e){
        return { status: "failed", msg: "request failed" }
    }
}

const getRankInfo = async () => {
    try {
        const response = await axios.get(rankInfoURL, {params: { member: "all" }});
        print(response.data);
        return response.data;
        
    } catch (e){
        return { status: "failed", msg: "request failed" }
    }
}

const getAllData = async () => {
    try {
        const resp = await axios.get(sheetURL,
        {
            params: {
                member: "all"
            }
        });

        return resp.data;
    } catch (error) {
        return {error}
    }
}

const resetCache = async () => {
    // reset the db
    const allData = await getAllData();

    if ("error" in allData) {
        console.log(allData);
        return
    }

    // console.log()
    // clear old data
    await prisma.member.deleteMany();
    let count = 1;
    
    // use this instead of map() to ensure synchronicity
    for(let k = 0; k < allData.length; k++){
        for(let i = 0; i < allData[k].length; i++){
            
            let id = count;
            let temp = { id, ...allData[k][i] };

            if ( !((typeof temp.monthly_share) === "string") ){
                temp.monthly_share = `${ (temp.monthly_share * 100).toFixed(0) }%`;
            }
            
            await prisma.member.create({
                data: temp
            });

            count++;
        }
    }
}

export default{ handleUser, runBot, getUserDetails, resetCache };

runBot();
// resetCache();
