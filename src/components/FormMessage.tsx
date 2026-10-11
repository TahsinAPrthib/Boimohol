// The success or error line under a settings form. role="status" so screen
// readers hear the outcome without the focus moving.
export default function FormMessage({ result }: { result: { success: boolean; message: string } | null }) {
  if (!result?.message) return null;
  return (
    <p
      role="status"
      className={`rounded-book border-2 px-3 py-2 font-body text-sm ${
        result.success ? "border-sage bg-sage/10 text-sage" : "border-oxblood bg-oxblood/10 text-oxblood"
      }`}
    >
      {result.message}
    </p>
  );
}
