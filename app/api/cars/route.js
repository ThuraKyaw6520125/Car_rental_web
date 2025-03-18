import { NextResponse } from "next/server";
import { Pool } from "pg";

// PostgreSQL connection pool
const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "1293",
  database: "CarRentalDB",
  port: 5432,
  max: 10, // Max connections in the pool
  idleTimeoutMillis: 30000,
});

// Fetch cars (GET)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get("ownerId");

  let client;
  try {
    client = await pool.connect();

    let query = `
      SELECT c.car_id, c.brand, c.model, c.manufacturedyear, c.price_per_day, c.car_type, c.availability,
             co.owner_id, co.ownername
      FROM Cars c
      JOIN CarOwner co ON c.owner_id = co.owner_id
    `;

    const values = [];
    if (ownerId) {
      query += ` WHERE c.owner_id = $1`;
      values.push(ownerId);
    }

    const result = await client.query(query, values);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching cars:", error.message);
    return NextResponse.json({ error: "Failed to fetch cars." }, { status: 500 });
  } finally {
    if (client) client.release(); // Release the client back to the pool
  }
}

// Add car (POST)
export async function POST(req) {
  const { brand, model, manufacturedYear, pricePerDay, availability, carType, ownerId } = await req.json();

  if (!brand || !model || !manufacturedYear || !pricePerDay || !carType || !ownerId) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  let client;
  try {
    client = await pool.connect();

    const query = `
      INSERT INTO Cars (brand, model, manufacturedyear, price_per_day, availability, car_type, owner_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const values = [brand, model, manufacturedYear, pricePerDay, availability, carType, ownerId];
    const result = await client.query(query, values);

    return NextResponse.json({ message: "Car added successfully!", car: result.rows[0] });
  } catch (error) {
    console.error("❌ Error adding car:", error.message);
    return NextResponse.json({ error: "Failed to add car." }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

