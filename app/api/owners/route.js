import { NextResponse } from "next/server";
import { Client } from "pg";

export async function GET(req, { params }) {
  const { id } = params;
  const client = new Client({
    host: "localhost",
    user: "postgres",
    password: "1293",
    database: "CarRentalDB",
    port: 5432,
  });

  try {
    await client.connect();
    const result = await client.query(
      "SELECT * FROM Cars WHERE owner_id = $1",
      [id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Error fetching owner's cars:", error.message);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  } finally {
    await client.end();
  }
}


