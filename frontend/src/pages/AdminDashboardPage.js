import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import SelectSlotPopup from "../components/SelectSlotPopup";

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
      active
        ? "border-primary text-primary"
        : "border-transparent text-gray-600 hover:text-gray-900"
    }`}
  >
    {children}
  </button>
);

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState("vehicles");
  const [showAddForm, setShowAddForm] = useState(false);
  const [q, setQ] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [slots, setSlots] = useState([]);
  const [payments, setPayments] = useState([]);
  const [parkingAreas, setParkingAreas] = useState([]);
  const [parkingCharges, setParkingCharges] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", phone: "" });
  const [newVehicle, setNewVehicle] = useState({
    plate: "",
    slotName: "",
    vehicleType: "Car",
  });
  const [newSlot, setNewSlot] = useState({ name: "", total: 50 });
  const [selectedParkingArea, setSelectedParkingArea] = useState("");
  const [newCharge, setNewCharge] = useState({
    vehicleType: "",
    amount: 0,
    duration: "per hour",
  });
  const [editingCharge, setEditingCharge] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showSlotPopup, setShowSlotPopup] = useState(false);
  const [selectedSlotNumber, setSelectedSlotNumber] = useState(null);
  const vehicleTypes = [
    "Car",
    "Bike",
    "Van",
    "Bus",
    "Truck",
    "Auto",
    "SUV",
    "Scooter",
    "Other",
  ];

  const tabs = [
    { id: "vehicles", name: "Vehicles" },
    { id: "users", name: "Users" },
    { id: "slots", name: "Slots" },
    { id: "payments", name: "Payments" },
    { id: "parking-areas", name: "Parking Areas" },
    { id: "parking-charges", name: "Parking Charges" },
  ];

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  const authHeader = useMemo(
    () => ({
      "Content-Type": "application/json",
      "x-admin-email": user?.email || "",
    }),
    [user?.email]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          vehiclesRes,
          usersRes,
          slotsRes,
          paymentsRes,
          parkingAreasRes,
          parkingChargesRes,
        ] = await Promise.all([
          fetch(`${API_URL}/vehicles`, { headers: authHeader }),
          fetch(`${API_URL}/users`, { headers: authHeader }),
          fetch(`${API_URL}/slots`, { headers: authHeader }),
          fetch(`${API_URL}/payments`, { headers: authHeader }),
          fetch(`${API_URL}/parking-areas`, { headers: authHeader }),
          fetch(`${API_URL}/parking-charges`, { headers: authHeader }),
        ]);

        setVehicles((await vehiclesRes.json()).vehicles || []);
        setUsersList((await usersRes.json()).users || []);
        setSlots((await slotsRes.json()).slots || []);
        setPayments((await paymentsRes.json()).payments || []);
        setParkingAreas((await parkingAreasRes.json()).parkingAreas || []);
        setParkingCharges((await parkingChargesRes.json()).charges || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data");
      }
    };
    if (user?.email) fetchData();
  }, [user?.email, authHeader, API_URL]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) =>
      [v.userEmail, v.plate, v.slotName, v.status, v.userPhone, v.userName]
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase())
    );
  }, [vehicles, q]);

  const filteredParkingAreas = useMemo(() => {
    return parkingAreas.filter((area) =>
      [area.name, area.address, area.status]
        .join(" ")
        .toLowerCase()
        .includes(q.toLowerCase())
    );
  }, [parkingAreas, q]);

  const fetchAvailableSlotsForArea = async (parkingAreaId) => {
    if (!parkingAreaId) {
      setAvailableSlots([]);
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/slot-management/parking-areas/${parkingAreaId}/available-slots`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch available slots");
      }
      setAvailableSlots(data.availableSlots || []);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      toast.error(error.message || "Failed to fetch available slots");
      setAvailableSlots([]);
    }
  };

  const createUserAndVehicle = async (e) => {
    e.preventDefault();
    if (!newUser.email || !newVehicle.plate) return;

    const promise = async () => {
      // create user
      const userRes = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify(newUser),
      });
      const userData = await userRes.json();
      if (!userRes.ok)
        throw new Error(userData.error || "Failed to create user");

      // Update users list with the returned user data
      if (userData.user) {
        setUsersList((prev) => {
          const existingUserIndex = prev.findIndex(
            (u) => u.email === userData.user.email
          );
          if (existingUserIndex >= 0) {
            // Update existing user
            const updated = [...prev];
            updated[existingUserIndex] = userData.user;
            return updated;
          } else {
            // Add new user to the system
            return [userData.user, ...prev];
          }
        });
      }

      if (selectedParkingArea && selectedSlotNumber !== null) {
        const slotRes = await fetch(`${API_URL}/slot-management/register-user`, {
          method: "POST",
          headers: authHeader,
          body: JSON.stringify({
            plate: newVehicle.plate,
            userEmail: newUser.email,
            userName: newUser.name,
            userPhone: newUser.phone,
            vehicleType: newVehicle.vehicleType,
            parkingAreaId: selectedParkingArea,
            slotNumber: selectedSlotNumber,
            createdBy: user?.email || "admin",
          }),
        });
        const slotData = await slotRes.json();
        if (!slotRes.ok)
          throw new Error(slotData.error || "Failed to create vehicle");

        const vehicleFromApi = slotData.vehicle;
        const normalizedVehicle = vehicleFromApi
          ? {
              ...vehicleFromApi,
              parkingAreaId:
                vehicleFromApi.parkingAreaId && vehicleFromApi.parkingAreaId._id
                  ? vehicleFromApi.parkingAreaId._id
                  : vehicleFromApi.parkingAreaId,
            }
          : null;

        if (normalizedVehicle) {
          setVehicles((prev) => [normalizedVehicle, ...prev]);
        }

        const updatedArea = slotData.parkingArea;
        if (updatedArea && updatedArea._id) {
          setParkingAreas((prev) =>
            prev.map((area) =>
              area._id === updatedArea._id ? { ...area, ...updatedArea } : area
            )
          );
        }
      } else {
        const vehicleRes = await fetch(`${API_URL}/vehicles`, {
          method: "POST",
          headers: authHeader,
          body: JSON.stringify({
            plate: newVehicle.plate,
            slotName: newVehicle.slotName || "",
            userEmail: newUser.email,
            userName: newUser.name,
            userPhone: newUser.phone,
            vehicleType: newVehicle.vehicleType,
            parkingAreaId: selectedParkingArea || undefined,
          }),
        });
        const vehicleData = await vehicleRes.json();
        if (!vehicleRes.ok)
          throw new Error(vehicleData.error || "Failed to create vehicle");
        setVehicles((prev) => [vehicleData.vehicle, ...prev]);
      }

      setNewUser({ name: "", email: "", phone: "" });
      setNewVehicle({ plate: "", slotName: "", vehicleType: "Car" });
      setSelectedParkingArea("");
      setSelectedSlotNumber(null);
      setAvailableSlots([]);
      setShowAddForm(false);

      // Return success message based on whether user was re-registered or new
      return userData.message || "User and vehicle created successfully!";
    };

    toast.promise(promise(), {
      loading: "Creating user and vehicle...",
      success: (message) => message,
      error: (err) => err.message || "An error occurred.",
    });
  };

  const markPaid = async (vehicle) => {
    const promise = async () => {
      // First mark as paid
      const res = await fetch(`${API_URL}/vehicles/${vehicle._id}/pay`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({ method: "Cash" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to mark as paid");
      }

      const data = await res.json();

      // Update the vehicle in the UI
      setVehicles((prev) =>
        prev.map((v) => (v._id === vehicle._id ? data.vehicle : v))
      );

      // Show success message with receipt info
      return `Payment marked as paid. Receipt sent to ${
        vehicle.userPhone ? "phone" : "email"
      }`;
    };

    toast.promise(promise(), {
      loading: "Processing payment and generating receipt...",
      success: (message) => message,
      error: (err) => err.message || "Failed to process payment",
    });
  };

  const exitVehicle = async (v) => {
    const promise = async () => {
      // Always prefer the slot-management exit to keep slots[] in sync.
      // If it fails for any reason, fall back to the legacy vehicles exit.
      let usedFallback = false;
      let data;
      try {
        const res = await fetch(
          `${API_URL}/slot-management/exit-user/${v._id}`,
          {
            method: "PUT",
            headers: authHeader,
            body: JSON.stringify({ exitTime: new Date().toISOString() }),
          }
        );
        data = await res.json();
        if (!res.ok) throw new Error(data.error || "Slot-managed exit failed");
      } catch (err) {
        usedFallback = true;
        const res = await fetch(`${API_URL}/vehicles/${v._id}/exit`, {
          method: "POST",
          headers: authHeader,
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to exit vehicle");
      }

      // Update the vehicle status locally
      setVehicles((prev) =>
        prev.map((item) =>
          item._id === v._id
            ? {
                ...item,
                status: data.vehicle?.status || "Exited",
                exitTime: data.vehicle?.exitTime || item.exitTime,
              }
            : item
        )
      );

      // If slot-management responded with updated area, sync counts
      const updatedArea = data.parkingArea;
      if (!usedFallback && updatedArea && updatedArea._id) {
        setParkingAreas((prev) =>
          prev.map((area) =>
            area._id === updatedArea._id ? { ...area, ...updatedArea } : area
          )
        );
      }
    };

    toast.promise(promise(), {
      loading: "Processing exit...",
      success: "Vehicle exited!",
      error: (err) => err.message || "An error occurred.",
    });
  };

  const updateSlot = async (s, next) => {
    try {
      const res = await fetch(`${API_URL}/slots/${s._id}`, {
        method: "PUT",
        headers: authHeader,
        body: JSON.stringify(next),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update slot");
      setSlots((prev) =>
        prev.map((item) => (item._id === s._id ? data.slot : item))
      );
      toast.success("Slot updated!");
    } catch (error) {
      toast.error(error.message || "Failed to update slot");
    }
  };

  const createSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.name || !newSlot.total) return;

    const promise = async () => {
      const res = await fetch(`${API_URL}/slots`, {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({ ...newSlot, free: newSlot.total }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create slot");
      setSlots((prev) => [data.slot, ...prev]);
      setNewSlot({ name: "", total: 50 }); // reset form
    };

    toast.promise(promise(), {
      loading: "Creating slot...",
      success: "Slot created!",
      error: (err) => err.message || "An error occurred.",
    });
  };

  // Parking Charges Management Functions
  const createOrUpdateParkingCharge = async (e) => {
    e.preventDefault();
    if (!newCharge.vehicleType || !newCharge.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const promise = async () => {
      const url = editingCharge
        ? `${API_URL}/parking-charges/${editingCharge._id}`
        : `${API_URL}/parking-charges`;

      const res = await fetch(url, {
        method: editingCharge ? "PUT" : "POST",
        headers: authHeader,
        body: JSON.stringify(newCharge),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to save parking charge");

      if (editingCharge) {
        setParkingCharges((prev) =>
          prev.map((c) => (c._id === data.charge._id ? data.charge : c))
        );
      } else {
        setParkingCharges((prev) => [data.charge, ...prev]);
      }

      setNewCharge({ vehicleType: "", amount: 0, duration: "per hour" });
      setEditingCharge(null);

      return editingCharge
        ? "Parking charge updated!"
        : "Parking charge created!";
    };

    toast.promise(promise(), {
      loading: editingCharge ? "Updating charge..." : "Creating charge...",
      success: (msg) => msg,
      error: (err) => err.message || "An error occurred.",
    });
  };

  const deleteParkingCharge = async (chargeId) => {
    if (!window.confirm("Are you sure you want to delete this parking charge?"))
      return;

    const promise = async () => {
      const res = await fetch(`${API_URL}/parking-charges/${chargeId}`, {
        method: "DELETE",
        headers: authHeader,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete parking charge");
      }

      setParkingCharges((prev) => prev.filter((c) => c._id !== chargeId));
    };

    toast.promise(promise(), {
      loading: "Deleting charge...",
      success: "Parking charge deleted!",
      error: (err) => err.message || "An error occurred.",
    });
  };

  const editParkingCharge = (charge) => {
    setNewCharge({
      vehicleType: charge.vehicleType,
      amount: charge.amount,
      duration: charge.duration || "per hour",
      description: charge.description || "",
    });
    setEditingCharge(charge);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage users, vehicles, slots, and payments.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-primary text-white"
            onClick={() => setShowAddForm(true)}
          >
            Add User & Vehicle
          </button>
          <Link
            to="/admin/parking-areas"
            state={{ openForm: true }}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 text-center"
          >
            Manage Parking Areas
          </Link>
        </div>
      </div>

      <div className="mt-6 bg-white border rounded-2xl shadow-sm">
        <div className="flex space-x-4 border-b mb-6 overflow-x-auto">
          {tabs.map(({ id, name }) => (
            <TabButton
              key={id}
              active={tab === id}
              onClick={() => {
                setTab(id);
                setShowAddForm(false);
              }}
            >
              {name}
              {id === "vehicles" && `(${vehicles.length})`}
              {id === "users" && `(${usersList.length})`}
              {id === "slots" && `(${slots.length})`}
              {id === "payments" && `(${payments.length})`}
              {id === "parking-areas" && `(${parkingAreas.length})`}
              {id === "parking-charges" && `(${parkingCharges.length})`}
            </TabButton>
          ))}
        </div>

        {showAddForm && (
          <div className="p-4">
            <form
              onSubmit={createUserAndVehicle}
              className="grid sm:grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div className="space-y-4">
                <h3 className="text-lg font-medium">User Details</h3>
                <input
                  placeholder="Name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser((u) => ({ ...u, name: e.target.value }))
                  }
                  className="w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                />
                <input
                  placeholder="Email"
                  required
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser((u) => ({ ...u, email: e.target.value }))
                  }
                  className="w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                />
                <input
                  placeholder="Phone"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser((u) => ({ ...u, phone: e.target.value }))
                  }
                  className="w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Vehicle Details</h3>
                <input
                  placeholder="Plate (e.g. TN-09-AB-1234)"
                  required
                  value={newVehicle.plate}
                  onChange={(e) =>
                    setNewVehicle((v) => ({ ...v, plate: e.target.value }))
                  }
                  className="w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                />

                <select
                  value={newVehicle.vehicleType}
                  onChange={(e) =>
                    setNewVehicle((v) => ({
                      ...v,
                      vehicleType: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                >
                  {vehicleTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedParkingArea}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedParkingArea(value);
                    setSelectedSlotNumber(null);
                    setAvailableSlots([]);
                    setNewVehicle((v) => ({ ...v, slotName: "" }));
                  }}
                  className="w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                >
                  <option value="">Select Parking Area (Optional)</option>
                  {parkingAreas
                    .filter((area) => area.active)
                    .map((area) => (
                      <option key={area._id} value={area._id}>
                        {area.name} ({area.availableSlots || 0}/
                        {area.totalSlots || area.slotAmount} slots available)
                      </option>
                    ))}
                </select>
                <div className="flex gap-2">
                  <input
                    placeholder="Slot (optional)"
                    value={newVehicle.slotName}
                    readOnly
                    className="flex-1 rounded-md border-gray-300 focus:border-primary focus:ring-primary bg-gray-50"
                  />
                  <button
                    type="button"
                    disabled={!selectedParkingArea}
                    onClick={async () => {
                      if (!selectedParkingArea) {
                        toast.error("Please select a parking area first");
                        return;
                      }
                      await fetchAvailableSlotsForArea(selectedParkingArea);
                      setShowSlotPopup(true);
                    }}
                    className="px-3 py-2 rounded-md bg-primary text-white disabled:bg-gray-400"
                  >
                    Select Slot
                  </button>
                </div>
                <button className="w-full px-4 py-2 rounded-md bg-gray-900 text-white">
                  Add User & Vehicle
                </button>
              </div>
            </form>
          </div>
        )}

        {tab === "vehicles" && (
          <div className="p-4">
            <div className="flex items-center justify-between gap-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search vehicles, users, status..."
                className="w-72 rounded-md border-gray-300 focus:border-primary focus:ring-primary"
              />
              <div className="text-sm text-gray-600">
                Total: {filteredVehicles.length}
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-3 pr-4">Plate</th>
                    <th className="py-3 pr-4">User</th>
                    <th className="py-3 pr-4">Phone</th>
                    <th className="py-3 pr-4 text-center">Parking Area</th>
                    <th className="py-3 pr-4 text-center">Status</th>
                    <th className="py-3 pr-4 text-center">Payment</th>
                    <th className="py-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((v) => (
                    <tr key={v._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 pr-4 whitespace-nowrap">{v.plate}</td>
                      <td className="py-3 pr-4">
                        {v.userName || v.userEmail || "-"}
                      </td>
                      <td className="py-3 pr-4">{v.userPhone || "-"}</td>
                      <td className="py-3 pr-4 text-center">
                        {v.parkingAreaId
                          ? parkingAreas.find(
                              (area) => area._id === v.parkingAreaId
                            )?.name || "Unknown Area"
                          : v.slotName || "-"}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            v.status === "Parked"
                              ? "bg-yellow-100 text-yellow-800"
                              : v.status === "Paid"
                              ? "bg-green-100 text-green-700"
                              : v.status === "Exited"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {v.status || "-"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        {v.paymentStatus || "Unpaid"}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <div className="inline-flex gap-2">
                          {v.paymentStatus !== "Paid" && (
                            <button
                              className="px-2 py-1 rounded-md border text-xs"
                              onClick={() => markPaid(v)}
                            >
                              Mark as Paid
                            </button>
                          )}
                          {v.status !== "Exited" && (
                            <button
                              className="px-2 py-1 rounded-md bg-gray-900 text-white text-xs"
                              onClick={() => exitVehicle(v)}
                              disabled={v.paymentStatus !== "Paid"}
                            >
                              Exit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "users" && (
          <div className="p-4">
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Phone</th>
                    <th className="py-3 pr-4">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 pr-4 whitespace-nowrap">
                        {u.name || "-"}
                      </td>
                      <td className="py-3 pr-4">{u.email}</td>
                      <td className="py-3 pr-4">{u.phone || "-"}</td>
                      <td className="py-3 pr-4">{u.role || "user"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "slots" && (
          <div className="p-4">
            <form
              onSubmit={createSlot}
              className="mb-6 p-4 border rounded-lg flex items-end gap-3"
            >
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700">
                  Area Name
                </label>
                <input
                  placeholder="e.g. Basement A"
                  value={newSlot.name}
                  onChange={(e) =>
                    setNewSlot((s) => ({ ...s, name: e.target.value }))
                  }
                  className="mt-1 w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total Spots
                </label>
                <input
                  type="number"
                  min="1"
                  value={newSlot.total}
                  onChange={(e) =>
                    setNewSlot((s) => ({ ...s, total: Number(e.target.value) }))
                  }
                  className="mt-1 w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                  required
                />
              </div>
              <button className="px-4 py-2 rounded-md bg-gray-900 text-white h-10">
                Create Slot
              </button>
            </form>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {slots.map((s) => (
                <div
                  key={s._id}
                  className="p-5 border rounded-xl bg-white shadow-sm"
                >
                  <div className="text-sm text-gray-500">
                    {s.area || s.name || "Area"}
                  </div>
                  <div className="mt-2 text-2xl font-bold text-gray-900">
                    {s.free ?? 0} / {s.total ?? 0} free
                  </div>
                  <div className="mt-3 h-2 bg-gray-100 rounded">
                    <div
                      className="h-2 bg-green-500 rounded"
                      style={{
                        width: `${
                          Math.max(
                            0,
                            Math.min(1, (s.free || 0) / (s.total || 1))
                          ) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      defaultValue={s.total ?? 0}
                      onBlur={(e) =>
                        updateSlot(s, {
                          total: Number(e.target.value),
                          free: s.free ?? 0,
                        })
                      }
                      className="rounded-md border-gray-300 text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      defaultValue={s.free ?? 0}
                      onBlur={(e) =>
                        updateSlot(s, {
                          total: s.total ?? 0,
                          free: Number(e.target.value),
                        })
                      }
                      className="rounded-md border-gray-300 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "payments" && (
          <div className="p-4">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Payment History
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Complete payment records from all transactions (View Only)
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b bg-gray-50">
                    <th className="py-3 px-4 font-medium">
                      Vehicle Number Plate
                    </th>
                    <th className="py-3 px-4 font-medium">Vehicle Type</th>
                    <th className="py-3 px-4 font-medium">User Name</th>
                    <th className="py-3 px-4 font-medium">User Email</th>
                    <th className="py-3 px-4 font-medium">Payment Amount</th>
                    <th className="py-3 px-4 font-medium">
                      Payment Date & Time
                    </th>
                    <th className="py-3 px-4 font-medium">Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {p.vehiclePlate || "-"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {p.vehicleType || "-"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-gray-900">
                          {p.userName || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {p.userEmail || "-"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-green-600">
                          ₹{p.amount || 0}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-900">
                          {p.paymentDate
                            ? new Date(p.paymentDate).toLocaleDateString()
                            : p.createdAt
                            ? new Date(p.createdAt).toLocaleDateString()
                            : "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {p.paymentDate
                            ? new Date(p.paymentDate).toLocaleTimeString()
                            : p.createdAt
                            ? new Date(p.createdAt).toLocaleTimeString()
                            : "-"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            p.status === "Success" || p.status === "Paid"
                              ? "bg-green-100 text-green-700"
                              : p.status === "Failed"
                              ? "bg-red-100 text-red-700"
                              : p.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {p.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {payments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  No payment records yet
                </h3>
                <p className="text-sm text-gray-500">
                  Payment records will appear here once users make payments.
                </p>
              </div>
            )}
          </div>
        )}

        {tab === "parking-areas" && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Parking Areas</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search parking areas..."
                    className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slots
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredParkingAreas.length > 0 ? (
                    filteredParkingAreas.map((area) => (
                      <tr key={area._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {area.photo && (
                              <div className="flex-shrink-0 h-10 w-10 mr-3">
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={area.photo}
                                  alt={area.name}
                                />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {area.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {area.address}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <span className="font-medium">
                              {area.availableSlots || 0}
                            </span>
                            <span className="text-gray-500">
                              {" "}
                              / {area.totalSlots || area.slotAmount}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              area.active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {area.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(area.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No parking areas found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "parking-charges" && (
          <div className="p-4">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Manage Parking Charges
              </h2>

              {/* Add/Edit Form */}
              <form
                onSubmit={createOrUpdateParkingCharge}
                className="bg-gray-50 p-4 rounded-lg border mb-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Vehicle Type
                    </label>
                    <select
                      value={newCharge.vehicleType}
                      onChange={(e) =>
                        setNewCharge((c) => ({
                          ...c,
                          vehicleType: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                      required
                      disabled={editingCharge}
                    >
                      <option value="">Select Type</option>
                      {vehicleTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newCharge.amount}
                      onChange={(e) =>
                        setNewCharge((c) => ({
                          ...c,
                          amount: parseFloat(e.target.value),
                        }))
                      }
                      className="mt-1 w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Duration
                    </label>
                    <select
                      value={newCharge.duration}
                      onChange={(e) =>
                        setNewCharge((c) => ({
                          ...c,
                          duration: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                    >
                      <option value="per hour">Per Hour</option>
                      <option value="per day">Per Day</option>
                      <option value="flat rate">Flat Rate</option>
                    </select>
                  </div>

                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                    >
                      {editingCharge ? "Update" : "Add"} Charge
                    </button>
                    {editingCharge && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCharge(null);
                          setNewCharge({
                            vehicleType: "",
                            amount: 0,
                            duration: "per hour",
                          });
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={newCharge.description || ""}
                    onChange={(e) =>
                      setNewCharge((c) => ({
                        ...c,
                        description: e.target.value,
                      }))
                    }
                    placeholder="e.g., Standard parking rate for cars"
                    className="mt-1 w-full rounded-md border-gray-300 focus:border-primary focus:ring-primary"
                  />
                </div>
              </form>

              {/* Parking Charges List */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 border-b bg-gray-50">
                      <th className="py-3 px-4 font-medium">Vehicle Type</th>
                      <th className="py-3 px-4 font-medium">Amount</th>
                      <th className="py-3 px-4 font-medium">Duration</th>
                      <th className="py-3 px-4 font-medium">Description</th>
                      <th className="py-3 px-4 font-medium">Status</th>
                      <th className="py-3 px-4 font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parkingCharges.length > 0 ? (
                      parkingCharges.map((charge) => (
                        <tr
                          key={charge._id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            <span className="font-medium text-gray-900">
                              {charge.vehicleType}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-lg font-semibold text-green-600">
                              ₹{charge.amount}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {charge.duration}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {charge.description || "-"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                charge.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {charge.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => editParkingCharge(charge)}
                                className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteParkingCharge(charge._id)}
                                className="px-3 py-1 rounded-md bg-red-500 text-white hover:bg-red-600 text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="py-8 text-center text-gray-500"
                        >
                          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                            <svg
                              className="h-6 w-6 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 mb-2">
                            No parking charges set
                          </h3>
                          <p className="text-sm text-gray-500">
                            Add parking charges for different vehicle types
                            above.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      <SelectSlotPopup
        isOpen={showSlotPopup}
        slots={availableSlots}
        onClose={() => setShowSlotPopup(false)}
        onSelect={(slotNumber) => {
          setSelectedSlotNumber(slotNumber);
          setNewVehicle((v) => ({ ...v, slotName: `Slot ${slotNumber}` }));
          setShowSlotPopup(false);
        }}
      />
    </div>
  );
};

export default AdminDashboardPage;
