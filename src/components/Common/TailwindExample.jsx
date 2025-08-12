import React from 'react';

const TailwindExample = () => {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-primary">
      {/* Header con Tailwind */}
      <header className="bg-bg-secondary border-b border-border-color p-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-accent-primary">
            Ejemplo de Tailwind CSS
          </h1>
          <p className="text-text-secondary mt-2">
            Integrado con tus estilos personalizados
          </p>
        </div>
      </header>

      {/* Sección principal */}
      <main className="container mx-auto p-6">
        {/* Grid responsivo con Tailwind */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1 - Usando clases de Tailwind */}
          <div className="bg-bg-secondary rounded-lg p-6 border border-border-color hover:border-accent-primary transition-colors duration-300">
            <h3 className="text-xl font-semibold text-accent-primary mb-3">
              Clases de Tailwind
            </h3>
            <p className="text-text-secondary mb-4">
              Puedes usar todas las clases utilitarias de Tailwind CSS como:
            </p>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>• <code className="font-code bg-bg-tertiary px-2 py-1 rounded">bg-bg-secondary</code></li>
              <li>• <code className="font-code bg-bg-tertiary px-2 py-1 rounded">text-accent-primary</code></li>
              <li>• <code className="font-code bg-bg-tertiary px-2 py-1 rounded">border-border-color</code></li>
              <li>• <code className="font-code bg-bg-tertiary px-2 py-1 rounded">hover:border-accent-primary</code></li>
            </ul>
          </div>

          {/* Card 2 - Combinando con CSS personalizado */}
          <div className="bg-gradient-to-br from-accent-primary to-accent-secondary rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-3">
              Gradientes Personalizados
            </h3>
            <p className="mb-4 opacity-90">
              Usando los colores personalizados definidos en tu configuración
            </p>
            <button className="bg-white text-accent-primary px-4 py-2 rounded-md font-semibold hover:bg-gray-100 transition-colors">
              Botón con Tailwind
            </button>
          </div>

          {/* Card 3 - Responsive design */}
          <div className="bg-bg-tertiary rounded-lg p-6 border border-border-light">
            <h3 className="text-xl font-semibold text-text-primary mb-3">
              Diseño Responsivo
            </h3>
            <p className="text-text-secondary mb-4">
              Tailwind hace el responsive design muy fácil con clases como:
            </p>
            <div className="space-y-2 text-sm">
              <div className="bg-accent-tertiary text-white p-2 rounded text-center">
                <span className="hidden sm:inline">Visible en sm+</span>
                <span className="sm:hidden">Solo móvil</span>
              </div>
              <div className="bg-accent-quaternary text-white p-2 rounded text-center">
                <span className="hidden md:inline">Visible en md+</span>
                <span className="md:hidden">Hasta md</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de botones */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Botones con Tailwind
          </h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-accent-primary hover:bg-accent-secondary text-white px-6 py-3 rounded-md font-semibold transition-colors duration-200">
              Botón Primario
            </button>
            <button className="bg-bg-secondary hover:bg-bg-tertiary text-text-primary border border-border-color px-6 py-3 rounded-md font-semibold transition-colors duration-200">
              Botón Secundario
            </button>
            <button className="bg-accent-tertiary hover:bg-accent-quaternary text-white px-6 py-3 rounded-md font-semibold transition-colors duration-200">
              Botón Terciario
            </button>
          </div>
        </section>

        {/* Sección de formularios */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Formularios con Tailwind
          </h2>
          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-text-secondary mb-2 font-medium">
                Nombre
              </label>
              <input 
                type="text" 
                className="w-full bg-bg-secondary border border-border-color rounded-md px-4 py-3 text-text-primary focus:border-accent-primary focus:outline-none transition-colors"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-text-secondary mb-2 font-medium">
                Email
              </label>
              <input 
                type="email" 
                className="w-full bg-bg-secondary border border-border-color rounded-md px-4 py-3 text-text-primary focus:border-accent-primary focus:outline-none transition-colors"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label className="block text-text-secondary mb-2 font-medium">
                Mensaje
              </label>
              <textarea 
                className="w-full bg-bg-secondary border border-border-color rounded-md px-4 py-3 text-text-primary focus:border-accent-primary focus:outline-none transition-colors resize-none"
                rows="4"
                placeholder="Tu mensaje..."
              ></textarea>
            </div>
          </div>
        </section>

        {/* Sección de utilidades */}
        <section>
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Utilidades de Tailwind
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-bg-secondary p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-accent-primary">12</div>
              <div className="text-sm text-text-muted">Espaciado</div>
            </div>
            <div className="bg-bg-secondary p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-accent-secondary">24</div>
              <div className="text-sm text-text-muted">Colores</div>
            </div>
            <div className="bg-bg-secondary p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-accent-tertiary">8</div>
              <div className="text-sm text-text-muted">Bordes</div>
            </div>
            <div className="bg-bg-secondary p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-accent-quaternary">∞</div>
              <div className="text-sm text-text-muted">Posibilidades</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default TailwindExample; 