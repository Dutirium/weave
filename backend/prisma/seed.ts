import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import process from "node:process";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Seeding additional data...");

    // --------------------------------------------------
    // 1. USERS
    // --------------------------------------------------

    const users = await Promise.all([
        prisma.user.upsert({
            where: { username: "neha" },
            update: {},
            create: {
                username: "neha",
                email: "neha@example.com",
                passwordHash: "seed_password_hash_neha",
            },
        }),

        prisma.user.upsert({
            where: { username: "dev" },
            update: {},
            create: {
                username: "dev",
                email: "dev@example.com",
                passwordHash: "seed_password_hash_dev",
            },
        }),

        prisma.user.upsert({
            where: { username: "kavya" },
            update: {},
            create: {
                username: "kavya",
                email: "kavya@example.com",
                passwordHash: "seed_password_hash_kavya",
            },
        }),

        prisma.user.upsert({
            where: { username: "rohan" },
            update: {},
            create: {
                username: "rohan",
                email: "rohan@example.com",
                passwordHash: "seed_password_hash_rohan",
            },
        }),

        prisma.user.upsert({
            where: { username: "isha" },
            update: {},
            create: {
                username: "isha",
                email: "isha@example.com",
                passwordHash: "seed_password_hash_isha",
            },
        }),
    ]);

    const [neha, dev, kavya, rohan, isha] = users;

    // --------------------------------------------------
    // 2. SESSIONS
    // --------------------------------------------------

    await prisma.session.createMany({
        data: [
            {
                session_id: "seed-session-neha-v2",
                user_id: neha.id,
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
            },
            {
                session_id: "seed-session-dev-v2",
                user_id: dev.id,
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24),
            },
        ],
        skipDuplicates: true,
    });

    // --------------------------------------------------
    // 3. WEAVE 5
    // --------------------------------------------------

    const weave5 = await prisma.weave.create({
        data: {
            creator: neha.id,
            title: "Will AI agents replace traditional software applications?",
        },
    });

    // --------------------------------------------------
    // 4. WEAVE 6
    // --------------------------------------------------

    const weave6 = await prisma.weave.create({
        data: {
            creator: dev.id,
            title: "Should developers prioritize system design over competitive programming?",
        },
    });

    // --------------------------------------------------
    // 5. WEAVE 7
    // --------------------------------------------------

    const weave7 = await prisma.weave.create({
        data: {
            creator: kavya.id,
            title: "Can open-source AI compete with closed-source models?",
        },
    });

    // --------------------------------------------------
    // 6. WEAVE 8
    // --------------------------------------------------

    const weave8 = await prisma.weave.create({
        data: {
            creator: rohan.id,
            title: "Should social media platforms be responsible for misinformation?",
        },
    });

    // --------------------------------------------------
    // 7. STANCES
    // --------------------------------------------------

    await prisma.weaveStance.createMany({
        data: [
            // Weave 5
            {
                user_id: neha.id,
                weave_id: weave5.id,
                stance: "SUPPORT",
            },
            {
                user_id: dev.id,
                weave_id: weave5.id,
                stance: "CHALLENGE",
            },
            {
                user_id: kavya.id,
                weave_id: weave5.id,
                stance: "NEUTRAL",
            },
            {
                user_id: rohan.id,
                weave_id: weave5.id,
                stance: "SUPPORT",
            },
            {
                user_id: isha.id,
                weave_id: weave5.id,
                stance: "CHALLENGE",
            },

            // Weave 6
            {
                user_id: dev.id,
                weave_id: weave6.id,
                stance: "SUPPORT",
            },
            {
                user_id: neha.id,
                weave_id: weave6.id,
                stance: "CHALLENGE",
            },
            {
                user_id: kavya.id,
                weave_id: weave6.id,
                stance: "NEUTRAL",
            },
            {
                user_id: rohan.id,
                weave_id: weave6.id,
                stance: "SUPPORT",
            },
            {
                user_id: isha.id,
                weave_id: weave6.id,
                stance: "CHALLENGE",
            },

            // Weave 7
            {
                user_id: kavya.id,
                weave_id: weave7.id,
                stance: "SUPPORT",
            },
            {
                user_id: neha.id,
                weave_id: weave7.id,
                stance: "CHALLENGE",
            },
            {
                user_id: dev.id,
                weave_id: weave7.id,
                stance: "NEUTRAL",
            },
            {
                user_id: rohan.id,
                weave_id: weave7.id,
                stance: "SUPPORT",
            },
            {
                user_id: isha.id,
                weave_id: weave7.id,
                stance: "CHALLENGE",
            },

            // Weave 8
            {
                user_id: rohan.id,
                weave_id: weave8.id,
                stance: "SUPPORT",
            },
            {
                user_id: neha.id,
                weave_id: weave8.id,
                stance: "CHALLENGE",
            },
            {
                user_id: dev.id,
                weave_id: weave8.id,
                stance: "NEUTRAL",
            },
            {
                user_id: kavya.id,
                weave_id: weave8.id,
                stance: "SUPPORT",
            },
            {
                user_id: isha.id,
                weave_id: weave8.id,
                stance: "CHALLENGE",
            },
        ],
        skipDuplicates: true,
    });

    // --------------------------------------------------
    // 8. WEAVE 5 MESSAGES
    // --------------------------------------------------

    const w5m1 = await prisma.messages.create({
        data: {
            content:
                "AI agents will become the primary interface for many software applications.",
            weave_id: weave5.id,
            user_id: neha.id,
            clientMessage_id: "v2-w5-client-1",
            stance: "SUPPORT",
            sequence: 1,
        },
    });

    const w5m2 = await prisma.messages.create({
        data: {
            content:
                "I support this. Users may increasingly describe what they want instead of navigating traditional interfaces.",
            weave_id: weave5.id,
            user_id: dev.id,
            clientMessage_id: "v2-w5-client-2",
            target_message_id: w5m1.id,
            relation: "SUPPORT",
            stance: "SUPPORT",
            sequence: 2,
        },
    });

    const w5m3 = await prisma.messages.create({
        data: {
            content:
                "Traditional applications still provide predictable workflows, permissions, and reliable user experiences.",
            weave_id: weave5.id,
            user_id: kavya.id,
            clientMessage_id: "v2-w5-client-3",
            target_message_id: w5m1.id,
            relation: "CHALLENGE",
            stance: "CHALLENGE",
            sequence: 3,
        },
    });

    const w5m4 = await prisma.messages.create({
        data: {
            content:
                "Could agents eventually generate interfaces dynamically for every individual user?",
            weave_id: weave5.id,
            user_id: rohan.id,
            clientMessage_id: "v2-w5-client-4",
            target_message_id: w5m2.id,
            relation: "QUESTION",
            stance: "NEUTRAL",
            sequence: 4,
        },
    });

    const w5m5 = await prisma.messages.create({
        data: {
            content:
                "That seems possible, especially when the agent understands the user's context and goals.",
            weave_id: weave5.id,
            user_id: neha.id,
            clientMessage_id: "v2-w5-client-5",
            target_message_id: w5m4.id,
            relation: "REPLY",
            stance: "SUPPORT",
            sequence: 5,
        },
    });

    await prisma.messages.create({
        data: {
            content:
                "But dynamically generated interfaces could become difficult to test and maintain.",
            weave_id: weave5.id,
            user_id: isha.id,
            clientMessage_id: "v2-w5-client-6",
            target_message_id: w5m4.id,
            relation: "COUNTER",
            stance: "CHALLENGE",
            sequence: 6,
        },
    });

    // --------------------------------------------------
    // 9. WEAVE 6 MESSAGES
    // --------------------------------------------------

    const w6m1 = await prisma.messages.create({
        data: {
            content:
                "System design should be prioritized because it teaches developers how real-world software works at scale.",
            weave_id: weave6.id,
            user_id: dev.id,
            clientMessage_id: "v2-w6-client-1",
            stance: "SUPPORT",
            sequence: 1,
        },
    });

    const w6m2 = await prisma.messages.create({
        data: {
            content:
                "I agree. Understanding databases, networking, and distributed systems is valuable for long-term growth.",
            weave_id: weave6.id,
            user_id: neha.id,
            clientMessage_id: "v2-w6-client-2",
            target_message_id: w6m1.id,
            relation: "SUPPORT",
            stance: "SUPPORT",
            sequence: 2,
        },
    });

    const w6m3 = await prisma.messages.create({
        data: {
            content:
                "Competitive programming develops problem-solving skills that are still important for technical interviews.",
            weave_id: weave6.id,
            user_id: kavya.id,
            clientMessage_id: "v2-w6-client-3",
            target_message_id: w6m1.id,
            relation: "CHALLENGE",
            stance: "CHALLENGE",
            sequence: 3,
        },
    });

    const w6m4 = await prisma.messages.create({
        data: {
            content:
                "Should students learn both simultaneously instead of choosing only one?",
            weave_id: weave6.id,
            user_id: rohan.id,
            clientMessage_id: "v2-w6-client-4",
            target_message_id: w6m3.id,
            relation: "QUESTION",
            stance: "NEUTRAL",
            sequence: 4,
        },
    });

    const w6m5 = await prisma.messages.create({
        data: {
            content:
                "Yes. Programming fundamentals and algorithms can be developed alongside basic system design concepts.",
            weave_id: weave6.id,
            user_id: dev.id,
            clientMessage_id: "v2-w6-client-5",
            target_message_id: w6m4.id,
            relation: "REPLY",
            stance: "SUPPORT",
            sequence: 5,
        },
    });

    await prisma.messages.create({
        data: {
            content:
                "System design without strong coding fundamentals can become too theoretical.",
            weave_id: weave6.id,
            user_id: isha.id,
            clientMessage_id: "v2-w6-client-6",
            target_message_id: w6m5.id,
            relation: "COUNTER",
            stance: "CHALLENGE",
            sequence: 6,
        },
    });

    // --------------------------------------------------
    // 10. WEAVE 7 MESSAGES
    // --------------------------------------------------

    const w7m1 = await prisma.messages.create({
        data: {
            content:
                "Open-source AI models can compete with closed-source models by enabling transparency and community innovation.",
            weave_id: weave7.id,
            user_id: kavya.id,
            clientMessage_id: "v2-w7-client-1",
            stance: "SUPPORT",
            sequence: 1,
        },
    });

    const w7m2 = await prisma.messages.create({
        data: {
            content:
                "Open-source projects benefit from contributions from researchers and developers across the world.",
            weave_id: weave7.id,
            user_id: neha.id,
            clientMessage_id: "v2-w7-client-2",
            target_message_id: w7m1.id,
            relation: "SUPPORT",
            stance: "SUPPORT",
            sequence: 2,
        },
    });

    const w7m3 = await prisma.messages.create({
        data: {
            content:
                "Closed-source companies often have access to much larger budgets, specialized hardware, and proprietary datasets.",
            weave_id: weave7.id,
            user_id: dev.id,
            clientMessage_id: "v2-w7-client-3",
            target_message_id: w7m1.id,
            relation: "CHALLENGE",
            stance: "CHALLENGE",
            sequence: 3,
        },
    });

    const w7m4 = await prisma.messages.create({
        data: {
            content:
                "Could smaller open-source models outperform larger models on specialized tasks?",
            weave_id: weave7.id,
            user_id: rohan.id,
            clientMessage_id: "v2-w7-client-4",
            target_message_id: w7m3.id,
            relation: "QUESTION",
            stance: "NEUTRAL",
            sequence: 4,
        },
    });

    const w7m5 = await prisma.messages.create({
        data: {
            content:
                "Yes. Fine-tuning and domain-specific training can make smaller models highly effective.",
            weave_id: weave7.id,
            user_id: kavya.id,
            clientMessage_id: "v2-w7-client-5",
            target_message_id: w7m4.id,
            relation: "REPLY",
            stance: "SUPPORT",
            sequence: 5,
        },
    });

    await prisma.messages.create({
        data: {
            content:
                "However, smaller models may still struggle with broad reasoning and complex tasks.",
            weave_id: weave7.id,
            user_id: isha.id,
            clientMessage_id: "v2-w7-client-6",
            target_message_id: w7m5.id,
            relation: "COUNTER",
            stance: "CHALLENGE",
            sequence: 6,
        },
    });

    // --------------------------------------------------
    // 11. WEAVE 8 MESSAGES
    // --------------------------------------------------

    const w8m1 = await prisma.messages.create({
        data: {
            content:
                "Social media platforms should take responsibility for reducing the spread of misinformation.",
            weave_id: weave8.id,
            user_id: rohan.id,
            clientMessage_id: "v2-w8-client-1",
            stance: "SUPPORT",
            sequence: 1,
        },
    });

    const w8m2 = await prisma.messages.create({
        data: {
            content:
                "I support this. Platforms control recommendation systems that can amplify misleading content.",
            weave_id: weave8.id,
            user_id: neha.id,
            clientMessage_id: "v2-w8-client-2",
            target_message_id: w8m1.id,
            relation: "SUPPORT",
            stance: "SUPPORT",
            sequence: 2,
        },
    });

    const w8m3 = await prisma.messages.create({
        data: {
            content:
                "But excessive moderation could allow companies to suppress legitimate opinions.",
            weave_id: weave8.id,
            user_id: dev.id,
            clientMessage_id: "v2-w8-client-3",
            target_message_id: w8m1.id,
            relation: "CHALLENGE",
            stance: "CHALLENGE",
            sequence: 3,
        },
    });

    const w8m4 = await prisma.messages.create({
        data: {
            content:
                "Should platforms rely on independent fact-checkers rather than making all decisions themselves?",
            weave_id: weave8.id,
            user_id: kavya.id,
            clientMessage_id: "v2-w8-client-4",
            target_message_id: w8m3.id,
            relation: "QUESTION",
            stance: "NEUTRAL",
            sequence: 4,
        },
    });

    const w8m5 = await prisma.messages.create({
        data: {
            content:
                "Independent fact-checkers could improve accountability, provided their methods are transparent.",
            weave_id: weave8.id,
            user_id: rohan.id,
            clientMessage_id: "v2-w8-client-5",
            target_message_id: w8m4.id,
            relation: "REPLY",
            stance: "SUPPORT",
            sequence: 5,
        },
    });

    await prisma.messages.create({
        data: {
            content:
                "Even independent fact-checkers can make mistakes, so users should retain the ability to challenge decisions.",
            weave_id: weave8.id,
            user_id: isha.id,
            clientMessage_id: "v2-w8-client-6",
            target_message_id: w8m5.id,
            relation: "COUNTER",
            stance: "CHALLENGE",
            sequence: 6,
        },
    });

    // --------------------------------------------------
    // 12. SUMMARY
    // --------------------------------------------------

    const userCount = await prisma.user.count();
    const weaveCount = await prisma.weave.count();
    const messageCount = await prisma.messages.count();
    const stanceCount = await prisma.weaveStance.count();
    const sessionCount = await prisma.session.count();

    console.log("Additional seed completed successfully.");
    console.log({
        users: userCount,
        weaves: weaveCount,
        messages: messageCount,
        stances: stanceCount,
        sessions: sessionCount,
    });
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