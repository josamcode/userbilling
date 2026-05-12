import { API_BASE } from "@/lib/api";

function resolveSrc(image, imageUrl) {
  if (imageUrl) return imageUrl;
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;
  return `${API_BASE}/images/users/${image}`;
}

const GRADIENTS = [
  "from-indigo-500 to-violet-500",
  "from-sky-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-fuchsia-500 to-purple-500",
  "from-blue-500 to-indigo-500",
];

function pickGradient(name) {
  if (!name) return GRADIENTS[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}

export function Avatar({
  src,
  imageUrl,
  alt,
  name,
  className = "",
  ringed = false,
}) {
  const resolved = resolveSrc(src, imageUrl);
  const initial = name ? name.trim().charAt(0).toUpperCase() : "?";
  const gradient = pickGradient(name);
  return (
    <div
      className={`overflow-hidden rounded-2xl flex items-center justify-center text-white font-bold ${
        ringed ? "ring-2 ring-white shadow-sm" : ""
      } ${className}`}
    >
      {resolved ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolved}
          alt={alt || name || "avatar"}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradient}`}
        >
          <span className="select-none">{initial}</span>
        </div>
      )}
    </div>
  );
}

export function AvatarFallback({ name }) {
  const firstLetter = name ? name.trim().charAt(0).toUpperCase() : "?";
  return <span>{firstLetter}</span>;
}
