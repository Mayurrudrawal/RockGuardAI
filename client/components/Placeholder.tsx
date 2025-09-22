export default function Placeholder({ title, description }: { title: string; description?: string }) {
  return (
    <div className="container mx-auto px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl md:text-5xl font-black mb-4">{title}</h1>
        {description ? (
          <p className="text-foreground/70">{description}</p>
        ) : (
          <p className="text-foreground/70">This section will be generated next. Keep prompting to fill in this page.</p>
        )}
      </div>
    </div>
  );
}
