import { NextResponse } from "next/server";
import { Client } from "pg";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
        return NextResponse.json({ error: "Customer ID is required." }, { status: 400 });
    }

    const client = new Client({
        host: "localhost",
        user: "postgres",
        password: "1293",
        database: "CarRentalDB",
        port: 5432,
    });

    try {
        await client.connect();

        const query = `
            SELECT b.booking_id, b.start_date, b.end_date, b.total_price, b.status,
                   c.car_id, c.brand, c.model, c.manufacturedyear, c.price_per_day
            FROM Booking b
            JOIN Cars c ON b.car_id = c.car_id
            WHERE b.customer_id = $1 AND b.status = 'Confirmed';
        `;

        const result = await client.query(query, [customerId]);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("❌ Failed to fetch rented cars:", error);
        return NextResponse.json({ error: "Failed to fetch rented cars." }, { status: 500 });
    } finally {
        await client.end();
    }
}
