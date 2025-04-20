import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import AuthCard from "@/components/AuthCard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16404D] to-[#2C768D] flex flex-col items-center justify-center px-4">
      {/* Logo at top */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="mb-10 text-center"
      >
        <Logo />
      </motion.div>

      {/* Auth options - Switched order: Applicant first, then Admin */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md flex flex-col items-center space-y-6"
      >
        <AuthCard
          title="Applicant"
          description="Submit your CV"
          type="applicant"
        />
        <AuthCard
          title="Admin"
          description="Manage CVs and requirements"
          type="admin"
        />
      </motion.div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-sm text-white font-['Inconsolata']">
          Created by Anandu - Hanan - Hrishikesh
        </p>
      </div>
    </div>
  );
};

export default Index;
