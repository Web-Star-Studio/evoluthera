
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Evoluthera
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Plataforma de acompanhamento terapêutico para o seu bem-estar emocional
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <img 
            src="https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80" 
            alt="Bem-estar" 
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
          <p className="text-lg text-gray-600 mb-6">
            Conectamos pacientes e profissionais de psicologia em uma jornada de crescimento pessoal e saúde mental.
          </p>
          <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700">
            <Link to="/login">
              Começar Agora
            </Link>
          </Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Para Pacientes</h3>
            <p className="text-gray-600">Acompanhe seu progresso e mantenha um diário emocional</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Para Profissionais</h3>
            <p className="text-gray-600">Gerencie seus pacientes e monitore o desenvolvimento</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Para Administradores</h3>
            <p className="text-gray-600">Supervisione a plataforma e analise métricas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
