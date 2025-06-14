import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Users, TrendingUp, Shield, MessageCircle, Calendar, FileText, BarChart3, Heart, Award, CheckCircle, ArrowRight, Mail, Phone, ChevronDown, ChevronUp, Star, Gamepad2, Clock, Lock, Sparkles, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    message: ""
  });

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission
  };

  const testimonials = [
    {
      quote: "A Evoluthera me permite acompanhar meus pacientes mesmo nos intervalos das sessões. Sinto que minha prática ficou mais completa.",
      author: "Dra. Juliana Ribeiro",
      role: "Psicóloga Clínica",
      location: "Recife"
    },
    {
      quote: "O prontuário eletrônico e os gráficos de progresso revolucionaram minha forma de trabalhar. Consigo ver padrões que antes passavam despercebidos.",
      author: "Dr. Carlos Santos",
      role: "Psicólogo Comportamental",
      location: "São Paulo"
    },
    {
      quote: "Meus pacientes adoraram o diário emocional e as tarefas gamificadas. O engajamento aumentou 70% desde que comecei a usar.",
      author: "Dra. Marina Costa",
      role: "Psicóloga Clínica",
      location: "Rio de Janeiro"
    }
  ];

  const faqs = [
    {
      question: "Quanto custa para usar a Evoluthera?",
      answer: "A Evoluthera cobra apenas R$ 20,00 por mês para cada paciente ativo. Não há taxa de adesão ou mensalidade fixa. Você só paga pelo que usar."
    },
    {
      question: "O paciente precisa pagar alguma coisa?",
      answer: "Não! O paciente não paga nada para usar a plataforma. Todo o custo é responsabilidade do psicólogo, que pode incluir esse valor no honorário da terapia."
    },
    {
      question: "A Evoluthera substitui a terapia?",
      answer: "Absolutamente não. A Evoluthera é uma ferramenta de apoio que potencializa o trabalho terapêutico, mas nunca substitui o profissional ou as sessões presenciais/online."
    },
    {
      question: "Os dados dos pacientes são seguros?",
      answer: "Sim! Utilizamos criptografia de ponta a ponta e seguimos rigorosamente a LGPD. Todos os dados são armazenados em servidores seguros no Brasil."
    },
    {
      question: "Como funciona a cobrança?",
      answer: "A cobrança é automática e mensal. Você recebe uma fatura com o valor correspondente ao número de pacientes ativos no período."
    },
    {
      question: "Posso usar a Evoluthera com pacientes presenciais?",
      answer: "Claro! A Evoluthera funciona perfeitamente tanto com pacientes presenciais quanto online, potencializando o acompanhamento entre as sessões."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/lovable-uploads/2efc273a-5ee9-4b8d-9f84-75c1295f89eb.png" alt="Evoluthera Logo" className="h-8 w-auto" />
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#sobre" className="text-gray-600 hover:text-blue-600 transition-colors">Sobre</a>
              <a href="#como-funciona" className="text-gray-600 hover:text-blue-600 transition-colors">Como Funciona</a>
              <a href="#funcionalidades" className="text-gray-600 hover:text-blue-600 transition-colors">Funcionalidades</a>
              <a href="#depoimentos" className="text-gray-600 hover:text-blue-600 transition-colors">Depoimentos</a>
              <a href="#contato" className="text-gray-600 hover:text-blue-600 transition-colors">Contato</a>
            </div>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/register">Começar Agora</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="relative pt-20 pb-32 min-h-screen flex items-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200 rounded-full opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-200 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
            <div className="space-y-8 animate-fade-in">
              {/* Premium Badge */}
              <div className="flex items-center space-x-3">
                <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 px-6 py-2 text-sm font-medium shadow-lg">
                  <Sparkles className="w-4 h-4 mr-2" />
                  R$20/mês por paciente ativo
                </Badge>
                <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50">
                  <Zap className="w-3 h-3 mr-1" />
                  Sem taxa de adesão
                </Badge>
              </div>

              {/* Main Heading */}
              <div className="space-y-6">
                <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 leading-tight">
                  <span className="block">Acompanhe.</span>
                  <span className="block">Conecte.</span>
                  <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Evolua.
                  </span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                  A plataforma inteligente que transforma o acompanhamento terapêutico com 
                  <span className="font-semibold text-blue-600"> dados em tempo real</span> e 
                  <span className="font-semibold text-indigo-600"> gamificação inovadora</span>.
                </p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 py-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">70%</div>
                  <div className="text-sm text-gray-600">+ Engajamento</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">24/7</div>
                  <div className="text-sm text-gray-600">Acompanhamento</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">100%</div>
                  <div className="text-sm text-gray-600">Seguro LGPD</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg px-8 py-4 h-auto shadow-xl transform hover:scale-105 transition-all duration-200">
                  <Link to="/register">
                    <Target className="mr-3 h-5 w-5" />
                    Começar Gratuitamente
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-50 text-lg px-8 py-4 h-auto">
                  <Heart className="mr-2 h-5 w-5" />
                  Agendar Demo
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6 pt-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-green-600" />
                  Certificado LGPD
                </div>
                <div className="flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-blue-600" />
                  Dados Criptografados
                </div>
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-2 text-purple-600" />
                  ISO 27001
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative lg:pl-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="relative">
                {/* Floating Elements */}
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-lg transform rotate-12 animate-pulse opacity-80"></div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg animate-pulse opacity-60" style={{ animationDelay: '1s' }}></div>
                
                {/* Main Image */}
                <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                  <img 
                    src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&q=80" 
                    alt="Psicólogo e paciente interagindo com plataforma digital" 
                    className="w-full h-auto"
                  />
                  
                  {/* Overlay with stats */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-gray-600">Progresso do Paciente</div>
                          <div className="text-2xl font-bold text-green-600">+85%</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Esta Semana</div>
                          <div className="flex items-center text-blue-600">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            <span className="font-semibold">Em alta</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Sobre a Evoluthera</h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-16 leading-relaxed">
            A Evoluthera nasceu para apoiar psicólogos no desafio de acompanhar a jornada emocional de seus pacientes 
            com mais precisão, engajamento e humanidade. Unimos tecnologia, dados e cuidado para transformar a forma de fazer terapia.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">+ Inteligência</h3>
              <p className="text-gray-600">Insights baseados em dados para decisões mais assertivas</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">+ Conexão</h3>
              <p className="text-gray-600">Acompanhamento contínuo entre as sessões</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">+ Resultados</h3>
              <p className="text-gray-600">Evolução clara e documentada do processo terapêutico</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Como Funciona</h2>
            <p className="text-xl text-gray-600">Comece a usar em 3 passos simples</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Psicólogo cria sua conta gratuita</h3>
              <p className="text-gray-600">Cadastro rápido e simples. Configure seu perfil e personalize sua prática.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Ativa seus pacientes e acompanha em tempo real</h3>
              <p className="text-gray-600">Convide seus pacientes e comece a receber dados valiosos sobre o progresso deles.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Evolui o tratamento com dados e interações personalizadas</h3>
              <p className="text-gray-600">Use insights inteligentes para tomar decisões mais assertivas no tratamento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Funcionalidades</h2>
            <p className="text-xl text-gray-600">Ferramentas completas para psicólogos e pacientes</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Para Psicólogos */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Para Psicólogos</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Prontuário eletrônico interativo</h4>
                    <p className="text-gray-600">Registre sessões, anotações e evolução do paciente</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Gráficos de progresso emocional</h4>
                    <p className="text-gray-600">Visualize a evolução do humor e bem-estar</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Testes automáticos com correção</h4>
                    <p className="text-gray-600">Aplique e corrija testes psicológicos automaticamente</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Tarefas terapêuticas e alertas inteligentes</h4>
                    <p className="text-gray-600">Crie tarefas personalizadas e receba alertas importantes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Cobrança automática por paciente ativo</h4>
                    <p className="text-gray-600">Sistema de faturamento simples e transparente</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Para Pacientes */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Para Pacientes</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Heart className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Diário emocional e check-ins diários</h4>
                    <p className="text-gray-600">Registre seu humor e emoções diariamente</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Tarefas com retorno do psicólogo</h4>
                    <p className="text-gray-600">Receba atividades personalizadas e feedback</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Gamepad2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Gamificação terapêutica</h4>
                    <p className="text-gray-600">Conquiste pontos e medalhas pelo seu progresso</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Testes e gráficos pessoais</h4>
                    <p className="text-gray-600">Acompanhe sua evolução com dados visuais</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Chat seguro (assíncrono)</h4>
                    <p className="text-gray-600">Comunique-se de forma segura com seu terapeuta</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="depoimentos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Depoimentos</h2>
            <p className="text-xl text-gray-600">O que os profissionais dizem sobre a Evoluthera</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
            <p className="text-xl text-gray-600">Tire suas dúvidas sobre a Evoluthera</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-gray-200">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors" 
                  onClick={() => toggleFAQ(index)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                    {expandedFAQ === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </CardHeader>
                {expandedFAQ === index && (
                  <CardContent className="pt-0">
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Entre em Contato</h2>
            <p className="text-xl text-gray-600">Estamos aqui para ajudar você a transformar sua prática</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="psicologo">Sou psicólogo</SelectItem>
                      <SelectItem value="clinica">Clínica</SelectItem>
                      <SelectItem value="paciente">Paciente</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem</label>
                  <Textarea 
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    required 
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Enviar Mensagem
                </Button>
              </form>
            </div>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Informações de Contato</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-600">contato@evoluthera.com.br</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-600">(11) 99999-9999</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Redes Sociais</h3>
                <div className="flex space-x-4">
                  <Button variant="outline" size="icon">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                    </svg>
                  </Button>
                  <Button variant="outline" size="icon">
                    <span className="sr-only">Instagram</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.017 0H7.984C3.467 0 0 3.467 0 7.984v4.032C0 16.533 3.467 20 7.984 20h4.033C16.533 20 20 16.533 20 12.017V7.984C20 3.467 16.533 0 12.017 0zm4.406 12.017c0 2.33-1.893 4.222-4.223 4.222H7.984c-2.33 0-4.222-1.893-4.222-4.222V7.984c0-2.33 1.893-4.223 4.222-4.223h4.216c2.33 0 4.223 1.893 4.223 4.223v4.033z" clipRule="evenodd" />
                      <path d="M10.017 4.88c-2.754 0-4.98 2.225-4.98 4.98 0 2.755 2.226 4.98 4.98 4.98 2.755 0 4.98-2.225 4.98-4.98 0-2.755-2.225-4.98-4.98-4.98zm0 8.222c-1.787 0-3.243-1.456-3.243-3.242S8.23 6.617 10.017 6.617s3.242 1.456 3.242 3.243-1.455 3.242-3.242 3.242zM15.284 2.855c0 .645-.522 1.167-1.166 1.167-.645 0-1.167-.522-1.167-1.167 0-.645.522-1.166 1.167-1.166.644 0 1.166.521 1.166 1.166z" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <img src="/lovable-uploads/2efc273a-5ee9-4b8d-9f84-75c1295f89eb.png" alt="Evoluthera Logo" className="h-8 w-auto mb-2 filter brightness-0 invert" />
              <p className="text-gray-400">© 2025 Evoluthera. Todos os direitos reservados.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Política de Privacidade</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Ajuda</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
