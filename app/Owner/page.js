"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import { useRouter } from "next/navigation";

export default function Owner() {
    const [filter, setFilter] = useState("All");
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddCarModal, setShowAddCarModal] = useState(false);
    const [user, setUser] = useState(null);
    const [newCar, setNewCar] = useState({
        brand: "",
        model: "",
        manufacturedYear: "",
        pricePerDay: "",
        availability: true,
        carType: "",
        ownerId: null,
    });

    const router = useRouter();

    // Fetch user and cars on page load
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));

        if (!storedUser || storedUser.userType !== "Owner") {
            alert("Access denied. Only owners can view this page.");
            router.push("/");
            return;
        }

        setUser(storedUser);
        setNewCar((prev) => ({ ...prev, ownerId: storedUser.ownerId }));
        fetchOwnerCars(storedUser.ownerId);
    }, [router]);

    // Fetch cars for the logged-in owner
    const fetchOwnerCars = async (ownerId) => {
        if (!ownerId) {
            console.error("❌ Owner ID is missing.");
            return;
        }

        try {
            const response = await fetch(`/api/carOwner?ownerId=${ownerId}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch cars.");
            }

            const data = await response.json();
            setCars(data);
            setLoading(false);
        } catch (error) {
            console.error("❌ Error fetching cars:", error.message);
            setLoading(false);
        }
    };

    // Handle Add Car
    const handleAddCar = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("/api/carOwner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCar),
            });

            if (!response.ok) throw new Error("Failed to add car.");

            alert("✅ Car added successfully!");
            setShowAddCarModal(false);
            fetchOwnerCars(user.ownerId);
        } catch (error) {
            console.error("❌ Error adding car:", error.message);
            alert("Failed to add car.");
        }
    };

    // Handle Delete Car
    const handleDeleteCar = async (carId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this car?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`/api/carOwner?carId=${carId}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (response.ok) {
                alert("✅ Car deleted successfully!");
                fetchOwnerCars(user.ownerId);
            } else {
                alert(result.error || "❌ Cannot delete the car. It might be currently rented.");
            }
        } catch (error) {
            console.error("❌ Error deleting car:", error.message);
            alert("Failed to delete the car.");
        }
    };

    // Filter cars by type
    const filteredCars = filter === "All" ? cars : cars.filter((car) => car.car_type === filter);

    return (
        <div className="bg-green-800 text-white min-h-screen flex flex-col">
            <Navbar />

            <section className="flex-grow text-center py-10">
                <h1 className="text-4xl font-bold mb-4">Welcome, {user?.name}</h1>
            </section>

            {/* Add Car Button */}
            <div className="text-center mb-4">
                <button
                    onClick={() => setShowAddCarModal(true)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg transition"
                >
                    Add Vehicle
                </button>
            </div>

            {/* Filter Section */}
            <section className="bg-gray-900 py-6">
                <div className="container mx-auto text-center">
                    <h2 className="text-3xl font-semibold text-white mb-4">Filter vehicles by Type</h2>
                    <div className="flex justify-center space-x-4">
                        {["Truck", "Van", "Car", "All"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-4 py-2 rounded-lg ${filter === type ? "bg-blue-500" : "bg-gray-700 hover:bg-gray-600"} text-white transition duration-300`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Car List Section */}
            <section className="bg-gray-900 py-10">
                <div className="container mx-auto text-center">
                    <h2 className="text-3xl font-semibold text-white mb-6">Your Vehicles</h2>

                    {loading ? (
                        <p className="text-gray-400">Loading your cars...</p>
                    ) : filteredCars.length === 0 ? (
                        <p className="text-gray-400">No cars found.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCars.map((car) => (
                                <div key={car.car_id} className="bg-white p-4 rounded-lg shadow-lg text-black">
                                    <h3 className="text-xl font-bold mb-2">{car.brand} {car.model}</h3>
                                    <p><strong>Year:</strong> {car.manufacturedyear}</p>
                                    <p><strong>Type:</strong> {car.car_type}</p>
                                    <p><strong>Price per Day:</strong> ${car.price_per_day}</p>
                                    <p><strong>Availability:</strong> {car.availability ? "Available" : "Rented"}</p>

                                    <div className="mt-4 flex justify-center">
                                        <button
                                            onClick={() => handleDeleteCar(car.car_id)}
                                            disabled={!car.availability}
                                            className={`px-4 py-2 rounded-lg ${car.availability ? "bg-red-500 hover:bg-red-700" : "bg-gray-400 cursor-not-allowed"} text-white`}
                                        >
                                            {car.availability ? "Delete Car" : "Rented - Cannot Delete"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Add Car Modal */}
            {showAddCarModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={() => setShowAddCarModal(false)}>
                    <div className="bg-white p-6 rounded-2xl shadow-lg max-w-lg w-full relative" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Car</h2>
                        <form onSubmit={handleAddCar} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Brand"
                                value={newCar.brand}
                                onChange={(e) => setNewCar({ ...newCar, brand: e.target.value })}
                                className="w-full p-2 border rounded text-black"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Model"
                                value={newCar.model}
                                onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                                className="w-full p-2 border rounded text-black"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Manufactured Year"
                                value={newCar.manufacturedYear}
                                onChange={(e) => setNewCar({ ...newCar, manufacturedYear: e.target.value })}
                                className="w-full p-2 border rounded text-black"
                                required
                            />
                            <input
                                type="number"
                                placeholder="Price Per Day"
                                value={newCar.pricePerDay}
                                onChange={(e) => setNewCar({ ...newCar, pricePerDay: e.target.value })}
                                className="w-full p-2 border rounded text-black"
                                required
                            />
                            <select
                                value={newCar.carType}
                                onChange={(e) => setNewCar({ ...newCar, carType: e.target.value })}
                                className="w-full p-2 border rounded text-black"
                                required
                            >
                                <option value="">Select Car Type</option>
                                <option value="Truck">Truck</option>
                                <option value="Van">Van</option>
                                <option value="Car">Sedan</option>
                            </select>
                            <button type="submit" className="px-4 py-2 bg-green-500 hover:bg-green-700 text-white rounded-lg">Add Car</button>
                            <button type="button" onClick={() => setShowAddCarModal(false)} className="ml-2 px-4 py-2 bg-gray-500 hover:bg-gray-700 text-white rounded-lg">Cancel</button>
                        </form>
                    </div>
                </div>
            )}

            <footer className="bg-gray-900 py-6 text-center text-sm">
                <p>&copy; 2025 Mikey's Co. All rights reserved.</p>
            </footer>
        </div>
    );
}
