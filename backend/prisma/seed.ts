import dotenv from "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import process from "node:process";


const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({adapter});

async function main() {
    console.log("Seeding database...");

    // --------------------------------------------------
    // 1. CLEAN DATABASE
    // --------------------------------------------------

    // Delete in dependency order because of relations.
    await prisma.messages.deleteMany();
    await prisma.session.deleteMany();
    await prisma.weave.deleteMany();
    await prisma.user.deleteMany();

    // --------------------------------------------------
    // 2. USERS
    // --------------------------------------------------

    const rj = await prisma.user.create({
        data: {
            username: "rj",
            email: "rj@example.com",
            passwordHash: "dummydummy",
        },
    });

    const alice = await prisma.user.create({
        data: {
            username: "alice",
            email: "alice@example.com",
            passwordHash: "seed_password_hash_alice",
        },
    });

    const bob = await prisma.user.create({
        data: {
            username: "bob",
            email: "bob@example.com",
            passwordHash: "seed_password_hash_bob",
        },
    });

    const charlie = await prisma.user.create({
        data: {
            username: "charlie",
            email: "charlie@example.com",
            passwordHash: "seed_password_hash_charlie",
        },
    });

    // --------------------------------------------------
    // 3. SESSIONS
    // --------------------------------------------------

    await prisma.session.createMany({
        data: [
            {
                session_id: "seed-session-rj",
                user_id: rj.id,
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
            },
            {
                session_id: "seed-session-alice",
                user_id: alice.id,
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
            },
            {
                session_id: "seed-session-bob",
                user_id: bob.id,
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
            },
            {
                session_id: "seed-session-charlie",
                user_id: charlie.id,
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
            },
        ],
    });

    // --------------------------------------------------
    // 4. WEAVE 1
    // --------------------------------------------------

    const weave1 = await prisma.weave.create({
        data: {
            creator: rj.id,
            title: "Is AI going to replace programmers?",
        },
    });

    // Original message
    const w1m1 = await prisma.messages.create({
        data: {
            content:
                "AI will probably change programming heavily, but I don't think it will completely replace programmers.",
            weave_id: weave1.id,
            user_id: rj.id,
            clientMessage_id: "w1-client-1",
            sequence: 1,
        },
    });

    const w1m2 = await prisma.messages.create({
        data: {
            content:
                "I support this. AI is becoming a tool rather than a complete replacement.",
            weave_id: weave1.id,
            user_id: alice.id,
            clientMessage_id: "w1-client-2",
            target_message_id: w1m1.id,
            relation: "SUPPORT",
            sequence: 2,
        },
    });

    const w1m3 = await prisma.messages.create({
        data: {
            content:
                "But AI coding agents can already build entire applications. That could reduce the number of developers needed.",
            weave_id: weave1.id,
            user_id: bob.id,
            clientMessage_id: "w1-client-3",
            target_message_id: w1m1.id,
            relation: "CHALLENGE",
            sequence: 3,
        },
    });

    const w1m4 = await prisma.messages.create({
        data: {
            content:
                "So perhaps the real question is whether programmers will evolve into system designers and AI supervisors?",
            weave_id: weave1.id,
            user_id: charlie.id,
            clientMessage_id: "w1-client-4",
            target_message_id: w1m3.id,
            relation: "QUESTION",
            sequence: 4,
        },
    });

    const w1m5 = await prisma.messages.create({
        data: {
            content:
                "Exactly. The job changes rather than simply disappearing.",
            weave_id: weave1.id,
            user_id: rj.id,
            clientMessage_id: "w1-client-5",
            target_message_id: w1m4.id,
            relation: "REPLY",
            sequence: 5,
        },
    });

    await prisma.messages.create({
        data: {
            content:
                "That sounds reasonable, but there will still be economic pressure to automate routine development.",
            weave_id: weave1.id,
            user_id: alice.id,
            clientMessage_id: "w1-client-6",
            target_message_id: w1m5.id,
            relation: "COUNTER",
            sequence: 6,
        },
    });

    // --------------------------------------------------
    // 5. WEAVE 2
    // --------------------------------------------------

    const weave2 = await prisma.weave.create({
        data: {
            creator: alice.id,
            title: "Will AGI arrive this decade?",
        },
    });

    const w2m1 = await prisma.messages.create({
        data: {
            content:
                "I think AGI arriving this decade is possible but far from guaranteed.",
            weave_id: weave2.id,
            user_id: alice.id,
            clientMessage_id: "w2-client-1",
            sequence: 1,
        },
    });

    const w2m2 = await prisma.messages.create({
        data: {
            content:
                "I support the possibility. The pace of progress has been extraordinary.",
            weave_id: weave2.id,
            user_id: rj.id,
            clientMessage_id: "w2-client-2",
            target_message_id: w2m1.id,
            relation: "SUPPORT",
            sequence: 2,
        },
    });

    const w2m3 = await prisma.messages.create({
        data: {
            content:
                "Current systems still have major limitations in reasoning and reliability.",
            weave_id: weave2.id,
            user_id: bob.id,
            clientMessage_id: "w2-client-3",
            target_message_id: w2m1.id,
            relation: "CHALLENGE",
            sequence: 3,
        },
    });

    const w2m4 = await prisma.messages.create({
        data: {
            content:
                "Could scaling alone solve those limitations?",
            weave_id: weave2.id,
            user_id: charlie.id,
            clientMessage_id: "w2-client-4",
            target_message_id: w2m3.id,
            relation: "QUESTION",
            sequence: 4,
        },
    });

    await prisma.messages.create({
        data: {
            content:
                "Possibly, but architecture and training methods may matter just as much.",
            weave_id: weave2.id,
            user_id: alice.id,
            clientMessage_id: "w2-client-5",
            target_message_id: w2m4.id,
            relation: "REPLY",
            sequence: 5,
        },
    });

    // --------------------------------------------------
    // 6. WEAVE 3
    // --------------------------------------------------

    const weave3 = await prisma.weave.create({
        data: {
            creator: bob.id,
            title: "Should college students learn system design?",
        },
    });

    const w3m1 = await prisma.messages.create({
        data: {
            content:
                "System design should be introduced much earlier in computer science education.",
            weave_id: weave3.id,
            user_id: bob.id,
            clientMessage_id: "w3-client-1",
            sequence: 1,
        },
    });

    const w3m2 = await prisma.messages.create({
        data: {
            content:
                "I agree. Understanding how systems fit together is extremely valuable.",
            weave_id: weave3.id,
            user_id: rj.id,
            clientMessage_id: "w3-client-2",
            target_message_id: w3m1.id,
            relation: "SUPPORT",
            sequence: 2,
        },
    });

    const w3m3 = await prisma.messages.create({
        data: {
            content:
                "But beginners should probably master programming fundamentals first.",
            weave_id: weave3.id,
            user_id: alice.id,
            clientMessage_id: "w3-client-3",
            target_message_id: w3m1.id,
            relation: "COUNTER",
            sequence: 3,
        },
    });

    const w3m4 = await prisma.messages.create({
        data: {
            content:
                "Could system design be taught alongside programming instead of after it?",
            weave_id: weave3.id,
            user_id: charlie.id,
            clientMessage_id: "w3-client-4",
            target_message_id: w3m3.id,
            relation: "QUESTION",
            sequence: 4,
        },
    });

    await prisma.messages.create({
        data: {
            content:
                "Yes, simple architectural concepts can be taught alongside normal projects.",
            weave_id: weave3.id,
            user_id: bob.id,
            clientMessage_id: "w3-client-5",
            target_message_id: w3m4.id,
            relation: "REPLY",
            sequence: 5,
        },
    });

    // --------------------------------------------------
    // 7. WEAVE 4
    // --------------------------------------------------

    const weave4 = await prisma.weave.create({
        data: {
            creator: charlie.id,
            title: "What will the internet look like in 2035?",
        },
    });

    const w4m1 = await prisma.messages.create({
        data: {
            content:
                "I think the internet will become much more agent-driven by 2035.",
            weave_id: weave4.id,
            user_id: charlie.id,
            clientMessage_id: "w4-client-1",
            sequence: 1,
        },
    });

    const w4m2 = await prisma.messages.create({
        data: {
            content:
                "That seems likely. People may interact with software through agents instead of traditional websites.",
            weave_id: weave4.id,
            user_id: rj.id,
            clientMessage_id: "w4-client-2",
            target_message_id: w4m1.id,
            relation: "SUPPORT",
            sequence: 2,
        },
    });

    const w4m3 = await prisma.messages.create({
        data: {
            content:
                "I think centralized AI platforms could become a major bottleneck.",
            weave_id: weave4.id,
            user_id: alice.id,
            clientMessage_id: "w4-client-3",
            target_message_id: w4m1.id,
            relation: "CHALLENGE",
            sequence: 3,
        },
    });

    const w4m4 = await prisma.messages.create({
        data: {
            content:
                "What happens to the open web if agents become the primary interface?",
            weave_id: weave4.id,
            user_id: bob.id,
            clientMessage_id: "w4-client-4",
            target_message_id: w4m3.id,
            relation: "QUESTION",
            sequence: 4,
        },
    });

    await prisma.messages.create({
        data: {
            content:
                "Search engines and websites may evolve into machine-readable services rather than pages.",
            weave_id: weave4.id,
            user_id: charlie.id,
            clientMessage_id: "w4-client-5",
            target_message_id: w4m4.id,
            relation: "REPLY",
            sequence: 5,
        },
    });

    // --------------------------------------------------
    // 8. PRINT SUMMARY
    // --------------------------------------------------

    const users = await prisma.user.count();
    const weaves = await prisma.weave.count();
    const messages = await prisma.messages.count();
    const sessions = await prisma.session.count();

    console.log("Seeding completed.");
    console.log(`Users: ${users}`);
    console.log(`Weaves: ${weaves}`);
    console.log(`Messages: ${messages}`);
    console.log(`Sessions: ${sessions}`);
}

main()
    .catch((error) => {
        console.error("Seeding failed:");
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
