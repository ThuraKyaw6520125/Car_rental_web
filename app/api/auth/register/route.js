import { NextResponse } from "next/server";
import { Client } from "pg";

export async function POST(req) {
    try {
        // 1️⃣ Parse request body
        const body = await req.json();
        console.log("📥 Received Registration Data:", body);

        // 2️⃣ Destructure expected fields
        const {
            email,
            password,
            userType,
            firstName,
            lastName,
            phone,
            address,
            street,
            city,
            province,
            country,
            driverLicense
        } = body;

        // 3️⃣ Check required fields
        if (!email || !password || !userType || !firstName || !lastName || !phone || !address || !street || !city || !province || !country) {
            console.error("❌ Missing required fields.");
            return NextResponse.json({ error: "All fields are required." }, { status: 400 });
        }

        // 4️⃣ Create PostgreSQL client
        const client = new Client({
            host: "localhost",
            user: "postgres",
            password: "1293", // Change if your password is different
            database: "CarRentalDB",
            port: 5432
        });

        // 5️⃣ Connect to DB
        await client.connect();
        console.log("✅ Connected to PostgreSQL");

        // 6️⃣ Insert user into Users table
        const userResult = await client.query(
            `INSERT INTO Users (Email, LoginPassword, User_Type)
             VALUES ($1, $2, $3) RETURNING User_ID`,
            [email, password, userType]
        );

        if (userResult.rowCount === 0) {
            console.error("❌ Failed to insert user.");
            return NextResponse.json({ error: "Failed to create user account." }, { status: 500 });
        }

        const userId = userResult.rows[0].user_id;
        console.log(`🆔 User created with ID: ${userId}`);

        // 7️⃣ Insert into Customer or Owner table
        if (userType === "Customer") {
            if (!driverLicense) {
                console.error("❌ Driver's license required for customers.");
                return NextResponse.json({ error: "Driver's license is required for customers." }, { status: 400 });
            }

            await client.query(
                `INSERT INTO Customer (User_ID, CustomerName, Driver_license, Phone_number, Address, Street, City, Province, Country)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [userId, `${firstName} ${lastName}`, driverLicense, phone, address, street, city, province, country]
            );
            console.log("👤 Customer registered successfully.");
        } else if (userType === "Owner") {
            await client.query(
                `INSERT INTO CarOwner (User_ID, OwnerName, Phone_number, Address, Street, City, Province, Country)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [userId, `${firstName} ${lastName}`, phone, address, street, city, province, country]
            );
            console.log("🚗 Owner registered successfully.");
        } else {
            console.error("❌ Invalid user type.");
            return NextResponse.json({ error: "Invalid user type." }, { status: 400 });
        }

        // 8️⃣ Close DB connection
        await client.end();
        console.log("🔒 Connection closed.");

        // 9️⃣ Success response
        return NextResponse.json({ message: "Account created successfully!" });

    } catch (error) {
        console.error("❌ Registration error:", error.message);
        return NextResponse.json({ error: error.message || "Failed to register." }, { status: 500 });
    }
}
