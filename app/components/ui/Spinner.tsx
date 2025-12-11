export default function Spinner({ size = 4 }: { size?: number }) {
  return (
    <div
      className="animate-spin rounded-full border-b-2 border-gray-900"
      style={{ width: size * 4, height: size * 4 }}
    />
  );
}
