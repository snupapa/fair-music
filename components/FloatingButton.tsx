export default function FloatingButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="
        fixed
        bottom-28 sm:bottom-10
        right-4 sm:right-15
        w-12 h-12 sm:w-14 sm:h-14
        bg-white
        text-black
        flex items-center justify-center
        text-xl
        rounded-xl
        shadow-lg
        hover:scale-105
        transition
      "
    >
      +
    </button>
  )
}
