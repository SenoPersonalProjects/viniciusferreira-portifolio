type FilmPerforationsProps = {
  position: "top" | "bottom";
};

export function FilmPerforations({ position }: FilmPerforationsProps) {
  return (
    <div
      aria-hidden="true"
      className={`absolute left-0 right-0 z-20 flex justify-around px-4 ${
        position === "top" ? "top-3" : "bottom-3"
      }`}
    >
      {Array.from({ length: 9 }).map((_, index) => (
        <span
          key={index}
          className="h-5 w-8 border border-[var(--film-perforation-border)] bg-[var(--film-perforation)]"
        />
      ))}
    </div>
  );
}