"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Card from "@/components/reportCard";
import { useRouter } from "next/navigation";

export default function Rent() {
    const [filter, setFilter] = useState("All");
    const [cars, setCars] = useState([]);
    const [rentedCars, setRentedCars] = useState([]);
    const [selectedCar, setSelectedCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [carTypes, setCarTypes] = useState(["All"]);
    const [customerId, setCustomerId] = useState(null);
    const [bookingDetails, setBookingDetails] = useState({
        startDate: "",
        endDate: "",
        pickUpStreet: "",
        pickUpCity: "",
        pickUpProvince: "",
        pickUpCountry: "",
        dropOffStreet: "",
        dropOffCity: "",
        dropOffProvince: "",
        dropOffCountry: "",
        totalPrice: 0,
    });

    const router = useRouter();

    // Fetch user and cars
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser?.userType === "Customer" && storedUser.customerId) {
            setCustomerId(storedUser.customerId);
            fetchRentedCars(storedUser.customerId);
        } else {
            alert("Access denied. Only customers can book a car.");
            router.push("/");
            return;
        }

        fetchCars();
    }, [router]);

    // Fetch available cars
    const fetchCars = async () => {
        try {
            const response = await fetch("/api/cars");
            if (!response.ok) throw new Error("Failed to fetch available cars.");
            const data = await response.json();
            setCars(data);
            setCarTypes(["All", ...new Set(data.map((car) => car.car_type))]);
        } catch (error) {
            console.error("❌ Fetch error:", error.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch rented cars for the logged-in customer
    const fetchRentedCars = async (customerId) => {
        try {
            const response = await fetch(`/api/rentedCars?customerId=${customerId}`);
            if (response.ok) {
                const data = await response.json();
                setRentedCars(data);
            } else {
                console.error("❌ Failed to fetch rented cars.");
            }
        } catch (error) {
            console.error("❌ Error fetching rented cars:", error.message);
        }
    };

    // Calculate total price
    const calculateTotalPrice = () => {
        if (selectedCar && bookingDetails.startDate && bookingDetails.endDate) {
            const start = new Date(bookingDetails.startDate);
            const end = new Date(bookingDetails.endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            setBookingDetails((prev) => ({
                ...prev,
                totalPrice: days > 0 ? days * selectedCar.price_per_day : 0,
            }));
        }
    };

    useEffect(() => {
        calculateTotalPrice();
    }, [bookingDetails.startDate, bookingDetails.endDate, selectedCar]);

    // Handle Booking
    const handleBooking = async () => {
        if (!customerId) {
            alert("You must be logged in as a customer to book a car.");
            return;
        }

        const requiredFields = [
            "startDate", "endDate",
            "pickUpStreet", "pickUpCity", "pickUpProvince", "pickUpCountry",
            "dropOffStreet", "dropOffCity", "dropOffProvince", "dropOffCountry"
        ];

        for (const field of requiredFields) {
            if (!bookingDetails[field]) {
                alert(`❌ Please fill out the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
                return;
            }
        }

        try {
            const response = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId,
                    carId: selectedCar.car_id,
                    ...bookingDetails
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert(`✅ Car booked successfully! Total Price: $${bookingDetails.totalPrice}`);
                setSelectedCar(null);
                setBookingDetails({
                    startDate: "",
                    endDate: "",
                    pickUpStreet: "",
                    pickUpCity: "",
                    pickUpProvince: "",
                    pickUpCountry: "",
                    dropOffStreet: "",
                    dropOffCity: "",
                    dropOffProvince: "",
                    dropOffCountry: "",
                    totalPrice: 0,
                });
                fetchRentedCars(customerId);
                fetchCars(); // Refresh cars list to reflect availability
            } else {
                alert(data.error || "❌ Failed to book the car.");
            }
        } catch (error) {
            console.error("❌ Booking error:", error.message);
        }
    };

    // Handle Car Return
    const handleReturnCar = async (bookingId, carId) => {
        try {
            const response = await fetch("/api/returnCar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookingId, carId }),
            });

            if (response.ok) {
                alert("✅ Car returned successfully!");

                // 🟢 Update state to prevent duplication
                setRentedCars((prev) => prev.filter((car) => car.booking_id !== bookingId));

                // Refresh available cars to re-add the returned car
                fetchCars();
            } else {
                const errorData = await response.json();
                alert(errorData.error || "❌ Failed to return the car.");
            }
        } catch (error) {
            console.error("❌ Return error:", error.message);
        }
    };

    const filteredCars = filter === "All" ? cars : cars.filter((car) => car.car_type === filter);

    return (
        <div className="bg-blue-800 text-white min-h-screen flex flex-col">
            <Navbar />

            <section className="text-center py-10">
                <h1 className="text-4xl font-bold mb-4">Available Cars for Rent</h1>
            </section>

            {/* Filter Section */}
            <section className="bg-gray-900 py-6">
                <div className="container mx-auto text-center">
                    <h2 className="text-3xl font-semibold mb-4">Filter by Car Type</h2>
                    <div className="flex justify-center space-x-4">
                        {carTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-4 py-2 rounded-lg ${filter === type ? "bg-blue-500" : "bg-gray-700 hover:bg-gray-600"} text-white`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Available Cars */}
            <section className="bg-gray-900 py-12">
                <div className="container mx-auto text-center">
                    {loading ? (
                        <p className="text-gray-400">Loading available cars...</p>
                    ) : filteredCars.length === 0 ? (
                        <p className="text-gray-400">No cars available for the selected type.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCars.map((car) => (
                                <Card
                                    key={car.car_id}
                                    title={`${car.brand} ${car.model}`}
                                    description={`Year: ${car.manufacturedyear}`}
                                    ownername={`Owner: ${car.ownername}`}
                                    imageUrl="https://via.placeholder.com/150"
                                    buttonText={`Price: $${car.price_per_day}/day`}
                                    onClick={() => setSelectedCar(car)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Rented Cars */}
            <section className="bg-green-800 py-12">
                <div className="container mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-6">Your Rented Cars</h2>
                    {rentedCars.length === 0 ? (
                        <p className="text-gray-400">You have no rented cars currently.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {rentedCars.map((car) => (
                                <Card
                                    key={car.booking_id}
                                    title={`${car.brand} ${car.model}`}
                                    description={`Rented from ${car.start_date} to ${car.end_date}`}
                                    ownername={`Price: $${car.total_price}`}
                                    imageUrl="https://via.placeholder.com/150"
                                    buttonText="Return Car"
                                    onClick={() => handleReturnCar(car.booking_id, car.car_id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {selectedCar && (
                <div className="fixed inset-0 overflow-y-auto bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl w-full overflow-auto">
                        <h2 className="text-2xl font-bold mb-4 text-gray-800">
                            Booking for {selectedCar.brand} {selectedCar.model}
                        </h2>

                        <div className="text-black mb-4">
                            <p><strong>Car Type:</strong> {selectedCar.car_type}</p>
                            <p><strong>Year:</strong> {selectedCar.manufacturedyear}</p>
                            <p><strong>Price per Day:</strong> ${selectedCar.price_per_day}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-black">Start Date</label>
                                <input
                                    type="date"
                                    value={bookingDetails.startDate}
                                    onChange={(e) => setBookingDetails({ ...bookingDetails, startDate: e.target.value })}
                                    className="w-full p-2 border rounded text-black"
                                />
                            </div>
                            <div>
                                <label className="block text-black">End Date</label>
                                <input
                                    type="date"
                                    value={bookingDetails.endDate}
                                    onChange={(e) => setBookingDetails({ ...bookingDetails, endDate: e.target.value })}
                                    className="w-full p-2 border rounded text-black"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <h3 className="text-lg font-semibold text-black">Pick-Up Location</h3>
                            {['Street', 'City', 'Province', 'Country'].map((field) => (
                                <input
                                    key={field}
                                    type="text"
                                    placeholder={field}
                                    className="w-full p-2 border rounded text-black mb-2"
                                    value={bookingDetails[`pickUp${field}`]}
                                    onChange={(e) => setBookingDetails({ ...bookingDetails, [`pickUp${field}`]: e.target.value })}
                                />
                            ))}
                        </div>

                        <div className="mt-4">
                            <h3 className="text-lg font-semibold text-black">Drop-Off Location</h3>
                            {['Street', 'City', 'Province', 'Country'].map((field) => (
                                <input
                                    key={field}
                                    type="text"
                                    placeholder={field}
                                    className="w-full p-2 border rounded text-black mb-2"
                                    value={bookingDetails[`dropOff${field}`]}
                                    onChange={(e) => setBookingDetails({ ...bookingDetails, [`dropOff${field}`]: e.target.value })}
                                />
                            ))}
                        </div>

                        <div className="text-xl font-semibold text-black my-4">
                            Total Price: ${bookingDetails.totalPrice}
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button onClick={handleBooking} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                Confirm Booking
                            </button>
                            <button onClick={() => setSelectedCar(null)} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
