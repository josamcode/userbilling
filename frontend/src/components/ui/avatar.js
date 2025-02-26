export function Avatar({ src, alt, name }) {
  return (
    <div className="w-full h-full overflow-hidden bg-gray-300 flex items-center justify-center text-white font-bold text-lg rounded-full">
      {src ? (
        <img src={`http://localhost:5000/images/users/`+src} alt={alt} className="w-full h-full object-cover rounded-full" />
      ) : (
        <AvatarFallback name={name} />
      )}
    </div>
  );
}

export function AvatarFallback({ name }) {
  const firstLetter = name ? name.charAt(0).toUpperCase() : "?";
  return <span className="text-gray-600">{firstLetter}</span>;
}
