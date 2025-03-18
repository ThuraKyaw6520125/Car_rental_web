import { NextResponse } from "next/server";
import { Client } from "pg";

// Database connection settings
const dbConfig = {
    host: "localhost",
    user: "postgres",
    password: "1293", // Update this with your actual password
    database: "CarRentalDB",
    port: 5432,
};

// 🚗 GET: Fetch cars for a specific owner
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");

    if (!ownerId) {
        return NextResponse.json({ error: "Owner ID is required" }, { status: 400 });
    }

    const client = new Client(dbConfig);

    try {
        await client.connect();
        console.log(`✅ Fetching cars for owner ID: ${ownerId}`);

        const result = await client.query(`
            SELECT * FROM Cars
            WHERE owner_id = $1
        `, [ownerId]);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("❌ Error fetching cars:", error.message);
        return NextResponse.json({ error: "Failed to fetch owner cars." }, { status: 500 });
    } finally {
        await client.end();
    }
}

// 🚗 POST: Add a new car for the logged-in owner
export async function POST(req) {
    const body = await req.json();
    const { brand, model, manufacturedYear, pricePerDay, availability, carType, ownerId } = body;

    if (!brand || !model || !manufacturedYear || !pricePerDay || !carType || !ownerId) {
        return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const client = new Client(dbConfig);

    try {
        await client.connect();

        await client.query(`
            INSERT INTO Cars (brand, model, manufacturedyear, price_per_day, availability, car_type, owner_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [brand, model, manufacturedYear, pricePerDay, availability, carType, ownerId]);

        return NextResponse.json({ message: "Car added successfully!" });
    } catch (error) {
        console.error("❌ Error adding car:", error.message);
        return NextResponse.json({ error: "Failed to add car." }, { status: 500 });
    } finally {
        await client.end();
    }
}

// 🚗 DELETE: Remove a car by ID (Prevent deletion if rented)
export async function DELETE(req) {
    const { searchParams } = new URL(req.url);
    const carId = searchParams.get("carId");

    if (!carId) {
        return NextResponse.json({ error: "Car ID is required for deletion." }, { status: 400 });
    }

    const client = new Client(dbConfig);

    try {
        await client.connect();

        // Check if car is currently rented
        const bookingResult = await client.query(
            "SELECT * FROM Booking WHERE car_id = $1 AND status != 'Returned'",
            [carId]
        );

        if (bookingResult.rows.length > 0) {
            return NextResponse.json({ error: "Cannot delete car. It is currently rented." }, { status: 403 });
        }

        // Proceed to delete the car
        const deleteResult = await client.query(
            "DELETE FROM Cars WHERE car_id = $1 RETURNING *",
            [carId]
        );

        if (deleteResult.rowCount === 0) {
            return NextResponse.json({ error: "Car not found or already deleted." }, { status: 404 });
        }

        return NextResponse.json({ message: "✅ Car deleted successfully!" });
    } catch (error) {
        console.error("❌ Error deleting car:", error.message);
        return NextResponse.json({ error: "Failed to delete car." }, { status: 500 });
    } finally {
        await client.end();
    }
}
