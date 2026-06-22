import { Toaster } from "sonner";
import { FreeEnrollmentForm } from "./components/FreeEnrollmentForm";

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        richColors
        toastOptions={{ style: { borderRadius: "14px", fontSize: "14px" } }}
      />
      <FreeEnrollmentForm />
    </>
  );
}
