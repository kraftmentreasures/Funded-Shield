interface AlertProps {
  variant: "success" | "error";
  message: string;
}

const styles = {
  success: "border-green-800 bg-green-950/50 text-green-300",
  error: "border-red-800 bg-red-950/50 text-red-300",
};

export function Alert({ variant, message }: AlertProps) {
  return (
    <div
      role="alert"
      className={`mb-4 rounded-lg border px-4 py-3 text-sm ${styles[variant]}`}
    >
      {message}
    </div>
  );
}
