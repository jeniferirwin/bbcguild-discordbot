import Eris from 'eris';
import axios from 'axios';
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();
const bot = new Eris(process.env.BOT_TOKEN);
const sheetURL = process.env.SHEET_URL;

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
            await bot.createMessage(target.id,
                "**BBC RANKINGS OVERVIEW:**\n\nOur rankings reports are updated weekly(ish) and are based on a rolling 30-Day History.\nEach update, an old week drops off and the latest week is added.\n\nThis report tracks all forms of contributions to the guild (and they all count equally).\n\n**RANKINGS DETERMINE MEMBER REMOVALS:**\nEach week, we make room for new members in the guild by removing the lowest contributing members.\nThose contributing less than 25% of their fair share over the past 30 days are at highest risk of removal.\n\n**NEW MEMBERS UNDER 30 DAYS:**\n\nWe won't have a full picture for you in this report until you've been a member for at least 30 days.\nThis is taken into consideration when we do our weekly purges.  For instance, if you've been in the guild for 10 days, we'll evaluate what tripling your activity looks like.\n\n**QUESTIONS OR CONCERNS:**\nIf there's something you don't understand, or if you think we've made a mistake with your contributions history, please reach out to @Hiyde!\n\n**THANK YOU FOR SUPPORTING THE BBC!**");
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

let sendMemberEmbed = async (member, msg) => {
    const converter = (val) =>  { var f = Intl.NumberFormat(); return f.format(val.toFixed(0)) };
    // console.log(member);
    const lastUpdated = new Date(member["timeupdated"] * 1000);
    const share_value = member["monthly_share"];

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
                    value: converter(member["weekly_cost"]) + "g per week - 344,000g per month",
                    inline: false
                },
                {
                    name: `You have contributed ${share_value} of your Fair Share for the past 30 days.`,
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
                    name: "Sales Tax",
                    value: converter(member["sales_tax"]),
                    inline: true
                },
                {
                    name: "Purchase Tax",
                    value: converter(member["purchase_tax"]) ,
                    inline: true
                },
                {
                    name: "Raffle Tix",
                    value: converter(member["raffle_tix"]),
                    inline: true
                },
                {
                    name: "Bank Misc",
                    value: converter(member["bank_misc"]),
                    inline: true
                },
                {
                    name: "Auctions",
                    value: converter(member["auctions"]),
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
                }
            ],
            footer: {
                text: `Rankings last updated ${ lastUpdated.getMonth() + 1 }/${ lastUpdated.getDate() }/${ lastUpdated.getFullYear() }\nType !rankinfo to learn how rankings work`
            }
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
        // console.log(row);
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
