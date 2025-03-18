import { NextResponse } from "next/server";
import { Client } from "pg";

export async function POST(req) {
    const { bookingId, carId } = await req.json();

    if (!bookingId || !carId) {
        return NextResponse.json({ error: "Booking ID and Car ID are required." }, { status: 400 });
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

        // Update booking status to 'Returned'
        await client.query(`UPDATE Booking SET status = 'Returned' WHERE booking_id = $1`, [bookingId]);

        // Mark car as available
        await client.query(`UPDATE Cars SET availability = TRUE WHERE car_id = $1`, [carId]);

        return NextResponse.json({ message: "Car returned successfully!" });
    } catch (error) {
        console.error("❌ Failed to return car:", error);
        return NextResponse.json({ error: "Failed to return car." }, { status: 500 });
    } finally {
        await client.end();
    }
}
