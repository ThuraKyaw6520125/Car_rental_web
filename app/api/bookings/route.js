import { NextResponse } from "next/server";
import { Client } from "pg";

export async function POST(req) {
    const {
        customerId,
        carId,
        startDate,
        endDate,
        pickUpStreet,
        pickUpCity,
        pickUpProvince,
        pickUpCountry,
        dropOffStreet,
        dropOffCity,
        dropOffProvince,
        dropOffCountry
    } = await req.json();

    if (!customerId || !carId || !startDate || !endDate || !pickUpStreet || !dropOffStreet) {
        return NextResponse.json({ error: "❌ Missing required booking fields." }, { status: 400 });
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

        // 🟢 Fetch car details
        const carResult = await client.query("SELECT * FROM Cars WHERE car_id = $1 AND availability = TRUE", [carId]);
        if (carResult.rows.length === 0) {
            return NextResponse.json({ error: "❌ Car not available." }, { status: 404 });
        }

        const car = carResult.rows[0];
        const totalDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        const totalPrice = totalDays * car.price_per_day;

        // 📝 Insert booking record with all fields
        await client.query(
            `INSERT INTO Booking (
                customer_id, owner_id, car_id, start_date, end_date, total_price, status, 
                pick_up_location, drop_off_location,
                PUStreet, PUCity, PUProvince, PUCountry,
                DOStreet, DOCity, DOProvince, DOCountry
            ) VALUES (
                $1, $2, $3, $4, $5, $6, 'Confirmed',
                $7, $8, 
                $9, $10, $11, $12, 
                $13, $14, $15, $16
            )`,
            [
                customerId,
                car.owner_id,
                carId,
                startDate,
                endDate,
                totalPrice,
                `${pickUpStreet}, ${pickUpCity}, ${pickUpProvince}, ${pickUpCountry}`,
                `${dropOffStreet}, ${dropOffCity}, ${dropOffProvince}, ${dropOffCountry}`,
                pickUpStreet,
                pickUpCity,
                pickUpProvince,
                pickUpCountry,
                dropOffStreet,
                dropOffCity,
                dropOffProvince,
                dropOffCountry
            ]
        );

        // 🚫 Mark car as unavailable after booking
        await client.query("UPDATE Cars SET availability = FALSE WHERE car_id = $1", [carId]);

        return NextResponse.json({ message: "✅ Car booked successfully!", totalPrice });
    } catch (error) {
        console.error("❌ Booking error:", error);
        return NextResponse.json({ error: "Failed to book car." }, { status: 500 });
    } finally {
        await client.end();
    }
}
