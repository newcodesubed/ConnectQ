import { useAuthStore } from "../store/auth.store";
import { useNavigate } from "react-router-dom";

export default function RoleSelect() {
  const { setRoleChoice, roleChoice } = useAuthStore();
  const navigate = useNavigate();

  const choose = (role: "client" | "company") => {
    setRoleChoice(role);
    navigate("/signup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-4 p-6 bg-white rounded-2xl shadow">
        <h1 className="text-2xl font-bold text-center">Who are you?</h1>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => choose("client")} className={`p-4 rounded-2xl border ${roleChoice==="client" ? "ring-2 ring-blue-500" : ""}`}>
            Client
          </button>
          <button onClick={() => choose("company")} className={`p-4 rounded-2xl border ${roleChoice==="company" ? "ring-2 ring-blue-500" : ""}`}>
            Company
          </button>
        </div>
        <p className="text-sm text-gray-500 text-center">You can change before submitting signup.</p>
      </div>
    </div>
  );
}
// import { useState } from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { useAuthStore,type Role } from "../store/auth.store";

// export default function RoleSelect() {
//   const [selectedRole, setSelectedRole] = useState<Role | null>(null);
//   const { setRoleChoice, user } = useAuthStore();
//   const navigate = useNavigate();

//   // Prevent page access if user already has a role
//   if (user?.role) {
//     navigate("/dashboard");
//   }

//   const handleSelectRole = () => {
//     if (!selectedRole) return;
//     setRoleChoice(selectedRole);
//     navigate("/dashboard");
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl p-8 text-center"
//     >
//       <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
//         Select Your Role
//       </h2>
//       <p className="text-gray-300 mb-6">Please choose the role that best describes you:</p>

//       <div className="flex flex-col gap-4">
//         <button
//           className={`py-3 rounded-lg font-semibold text-white transition ${
//             selectedRole === "client"
//               ? "bg-green-500"
//               : "bg-gray-700 hover:bg-green-600"
//           }`}
//           onClick={() => setSelectedRole("client")}
//         >
//           Client
//         </button>

//         <button
//           className={`py-3 rounded-lg font-semibold text-white transition ${
//             selectedRole === "company"
//               ? "bg-emerald-500"
//               : "bg-gray-700 hover:bg-emerald-600"
//           }`}
//           onClick={() => setSelectedRole("company")}
//         >
//           Company
//         </button>
//       </div>

//       <motion.button
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//         disabled={!selectedRole}
//         onClick={handleSelectRole}
//         className="mt-6 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         Confirm Role
//       </motion.button>
//     </motion.div>
//   );
// }
