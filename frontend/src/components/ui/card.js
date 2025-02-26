export function Card({ children, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex flex-row justify-between bg-white shadow-md rounded-lg p-4 border border-gray-200 cursor-pointer relative"
    >
      {children}
    </div>
  );
}

export function CardContent({ children }) {
  return <div className="mt-2">{children}</div>;
}
