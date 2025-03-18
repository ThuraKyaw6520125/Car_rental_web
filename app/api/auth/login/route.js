import { NextResponse } from "next/server";
import { Client } from "pg";

export async function POST(req) {
    const { email, password } = await req.json();

    const client = new Client({
        host: "localhost",
        user: "postgres",
        password: "1293",
        database: "CarRentalDB",
        port: 5432,
    });

    try {
        await client.connect();

        const userResult = await client.query(
            `SELECT u.*, c.customer_id, o.owner_id, a.admin_id
             FROM Users u
             LEFT JOIN Customer c ON u.user_id = c.user_id
             LEFT JOIN CarOwner o ON u.user_id = o.user_id
             LEFT JOIN PageAdmin a ON u.user_id = a.user_id
             WHERE u.email = $1 AND u.loginpassword = $2`,
            [email, password]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json({ error: "❌ Invalid email or password" }, { status: 401 });
        }

        const user = userResult.rows[0];

        return NextResponse.json({
            message: "✅ Login successful",
            user: {
                id: user.user_id,
                email: user.email,
                userType: user.user_type,
                customerId: user.customer_id || null,
                ownerId: user.owner_id || null,
                adminId: user.admin_id || null, // Ensure admin ID is passed if available
            },
        });

    } catch (error) {
        console.error("❌ Login error:", error.message);
        return NextResponse.json({ error: "Failed to login" }, { status: 500 });
    } finally {
        await client.end();
    }
}

