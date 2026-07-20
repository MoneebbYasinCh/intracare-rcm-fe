export function PageWrapper({ children, className = '' }) {
  return (
    <div className={`min-h-screen bg-surface ${className}`}>
      {children}
    </div>
  );
}

export function PageContent({ children, className = '' }) {
  return (
    <main className={`w-[95%] md:w-[90%] mx-auto py-4 ${className}`}>
      {children}
    </main>
  );
}

export function Section({ children, className = '' }) {
  return (
    <section className={`mb-4 ${className}`}>
      {children}
    </section>
  );
}

export function Grid({ children, cols = 2, className = '' }) {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2',
    4: 'grid-cols-1 md:grid-cols-2',
  };

  return (
    <div className={`grid ${colsClass[cols]} gap-4 ${className}`}>
      {children}
    </div>
  );
}
