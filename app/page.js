/*
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function Login() {

  
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const router = useRouter();
  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault(); // Prevent form reload
    router.push("/Home"); // Redirect to dashboard
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Welcome to Mikey's rentals</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700">Username</label>
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username or e-mail"
            />
          </div>

          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
*/

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
        userType: "Customer",
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        street: "",
        city: "",
        province: "",
        country: "",
        driverLicense: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const router = useRouter();

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials({ ...credentials, [name]: value });
    };

    // Field validation function
    const validateFields = () => {
        const requiredFields = ["firstName", "lastName", "email", "password", "phone", "address", "street", "city", "province", "country"];
        if (credentials.userType === "Customer") requiredFields.push("driverLicense");

        for (const field of requiredFields) {
            if (!credentials[field] || credentials[field].trim() === "") {
                setError(`Please fill out the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
                return false;
            }
        }
        return true;
    };

    // Handle login submission
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const { email, password } = credentials;

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.user) {
                localStorage.setItem("user", JSON.stringify(data.user));

                // Redirect based on userType
                switch (data.user.userType) {
                    case "Owner":
                        router.push("/Owner");
                        break;
                    case "Customer":
                        router.push("/Rent");
                        break;
                    case "Admin":
                        router.push("/Admin");  // Redirect admin to the Admin page
                        break;
                    default:
                        alert("Access denied. Unknown user type.");
                }
            } else {
                setError(data.error || "❌ Login failed.");
            }
        } catch (err) {
            setError("❌ Network error. Please try again.");
        }
    };

    // Handle registration
    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validateFields()) return;

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess("✅ Account created successfully! Please log in.");
                setIsLogin(true);
                setCredentials({ email: "", password: "" });
            } else {
                setError(data.error || "❌ Failed to register.");
            }
        } catch (err) {
            setError("❌ Network error during registration.");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                    {isLogin ? "Login to Car Rental" : "Create Your Account"}
                </h2>

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                {success && <p className="text-green-500 text-center mb-4">{success}</p>}

                <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
                    {/* Email & Password */}
                    <div>
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={credentials.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg"
                            placeholder="Enter password"
                        />
                    </div>

                    {/* Registration Fields */}
                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-gray-700">User Type</label>
                                <select
                                    name="userType"
                                    value={credentials.userType}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg"
                                >
                                    <option value="Customer">Customer</option>
                                    <option value="Owner">Owner</option>
                                </select>
                            </div>

                            {/* Personal Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={credentials.firstName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg"
                                        placeholder="First name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={credentials.lastName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg"
                                        placeholder="Last name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700">Phone Number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={credentials.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="Phone number"
                                />
                            </div>

                            {/* Address Info */}
                            <div>
                                <label className="block text-gray-700">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={credentials.address}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="Full address"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700">Street</label>
                                <input
                                    type="text"
                                    name="street"
                                    value={credentials.street}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg"
                                    placeholder="Street"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-gray-700">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={credentials.city}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg"
                                        placeholder="City"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700">Province</label>
                                    <input
                                        type="text"
                                        name="province"
                                        value={credentials.province}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg"
                                        placeholder="Province"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={credentials.country}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg"
                                        placeholder="Country"
                                    />
                                </div>
                            </div>

                            {credentials.userType === "Customer" && (
                                <div>
                                    <label className="block text-gray-700">Driver's License</label>
                                    <input
                                        type="text"
                                        name="driverLicense"
                                        value={credentials.driverLicense}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg"
                                        placeholder="Driver's License"
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                    >
                        {isLogin ? "Login" : "Register"}
                    </button>
                </form>

                {/* Toggle between Login and Register */}
                <div className="mt-4 text-center">
                    {isLogin ? (
                        <p>
                            Don't have an account?{" "}
                            <button onClick={() => setIsLogin(false)} className="text-blue-500 underline">
                                Register here
                            </button>
                        </p>
                    ) : (
                        <p>
                            Already have an account?{" "}
                            <button onClick={() => setIsLogin(true)} className="text-blue-500 underline">
                                Login here
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
