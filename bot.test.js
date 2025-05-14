import { it, test, expect, describe, jest, beforeEach, afterEach } from '@jest/globals';
import Eris from 'eris';
import axios from 'axios';

import botAPi from './bot';
import { PrismaClient } from '@prisma/client';

let mockMsg;

jest.mock('axios');
jest.mock('eris', () => {
    const Eris = jest.fn().mockImplementation((token) => console.log(token));

    Eris.prototype.on = jest.fn().mockImplementation(async(event, fn) => {
        if(event === "messageCreate"){ // we are only testing the messageCreate event
            await fn(mockMsg);
        }
    });

    Eris.prototype.createMessage = jest.fn().mockImplementation((msgID, msgContent) => 
        Promise.resolve([msgID, msgContent]));

    Eris.prototype.connect = jest.fn();

    return Eris;
});

jest.mock('@prisma/client', () => {
    const Member = jest.fn();

    Member.prototype.create = jest.fn();
    Member.prototype.findFirst = jest.fn();
    Member.prototype.deleteMany = jest.fn();
    Member.prototype.findMany = jest.fn();

    function PrismaClient(){
        this.member = new Member();
    }

    return { PrismaClient }
});


let prisma = new PrismaClient();
let bot = new Eris("");

describe("Series of tests to ensure proper bot execution", () => {
    let member = "lylanthia";

    let mockMember = [
        {"sheet_title":"Bleakrock Barter Co - 30 Day Rankings","weekly_cost":175000,"timeupdated":1674104400,"rank":303,"member":"lylanthia","monthly_share":0.2923783415550858,"sales_tax":155429.26,"purchase_tax":62385.295000000006,"raffle_tix":0,"bank_misc":0,"auctions":0,"total_gold":217814.55500000002},
        {"sheet_title":"Blackbriar Barter Co - 30 Day Rankings","weekly_cost":80000,"timeupdated":1674104400,"rank":39,"member":"lylanthia","monthly_share":">100%","sales_tax":182435.75000000003,"purchase_tax":23393.405000000002,"raffle_tix":2000000,"bank_misc":0,"auctions":0,"total_gold":2205829.1550000003}
    ]

    let URL = process.env.SHEET_URL;

    // let prisma, bot;
    //

    beforeEach(() => {
        mockMsg = {
            content: "",
            channel: {
                id: 5754789
            },
            author: {
                username: "Pfftman",
                avatarURL: "http://discord.gg/avatar"
            }

        }

        // prisma = new PrismaClient();
        // bot = new Eris("");
        // sheetURL = jest.fn(() => "foo");
    });

    afterEach(() => {
        jest.clearAllMocks();
        // jest.resetAllMocks();

        // bot.on.mockReset();
        // bot.createMessage.mockReset();

        axios.get.mockReset();
        prisma.member.findMany.mockReset();
        // jest.restoreAllMocks();

        mockMsg.content = "";
    })

    test('getUserDetails', async () => {
        axios.get.mockResolvedValueOnce({ data: mockMember } );

        const foo = await botAPi.getUserDetails(member);

        expect(axios.get).toHaveBeenCalledWith(URL, { params: { member } });
        expect(foo).toBe(mockMember);
    });

    test("get user bot flow", async () => {
        mockMsg.content = "!lylanthia";
        axios.get.mockResolvedValueOnce({ data: mockMember } );
        prisma.member.findMany.mockResolvedValueOnce( [ { id: 1, ...mockMember[0] }, { id: 2, ...mockMember[1] } ] )
        
        await botAPi.runBot();

        expect(bot.on).toHaveBeenCalledTimes(2);
        // expect(bot.createMessage).toHaveBeenCalled();

        // expect()
        expect(bot.connect).toHaveBeenCalled();
    });

    test("resetCache", async () => {
        axios.get.mockResolvedValueOnce({ data: [ mockMember, mockMember ] });

        
        prisma.member.findFirst.mockResolvedValueOnce(1);
        prisma.member.findFirst.mockResolvedValueOnce(2);

        await botAPi.resetCache();

        expect(prisma.member.deleteMany).toHaveBeenCalled();

        expect(prisma.member.create).toHaveBeenCalledTimes(4);

        /* expect(prisma.member.create).toHaveBeenCalledWith({ data: { id: 1, ...mockMember[0] }});
        expect(prisma.member.create).toHaveBeenCalledWith({ data: { id: 2, ...mockMember[1] }});

        expect(prisma.member.create).toHaveBeenCalledWith({ data: { id: 3, ...mockMember[0] }});
        expect(prisma.member.create).toHaveBeenCalledWith({ data: { id: 4, ...mockMember[1] }}); */
    })
})