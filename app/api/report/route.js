import { NextResponse } from "next/server";
import { Client } from "pg";

// POST: Create a new report
export async function POST(req) {
    const { customerId, carId, reason, description } = await req.json();

    if (!customerId || !carId || !reason || !description) {
        return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const client = new Client({
        host: "localhost",
        user: "postgres",
        password: "1293",  // Make sure this is your actual password
        database: "CarRentalDB",
        port: 5432,
    });

    try {
        await client.connect();

        // Get admin ID (assuming the first admin for simplicity)
        const adminResult = await client.query(`SELECT Admin_ID FROM PageAdmin LIMIT 1`);
        const adminId = adminResult.rows[0]?.admin_id;

        if (!adminId) {
            return NextResponse.json({ error: "Admin not found." }, { status: 500 });
        }

        // Insert the report into the Report table
        const result = await client.query(
            `INSERT INTO Report (
                Reporter_ID, Reporter_Type, Reporter_Customer_ID,
                Reported_ID, Reported_Type, Reported_Car_ID,
                Car_ID, Admin_ID, Status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Open')
            RETURNING *`,
            [customerId, 'Customer', customerId, carId, 'Car', carId, carId, adminId]
        );

        return NextResponse.json({ message: "Report submitted successfully!", report: result.rows[0] });
    } catch (error) {
        console.error("❌ Report submission error:", error.message);
        return NextResponse.json({ error: "Failed to submit the report." }, { status: 500 });
    } finally {
        await client.end();
    }
}
