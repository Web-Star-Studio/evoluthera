import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { Plus, User, Calendar, TrendingUp, CreditCard, CheckCircle, Clock, AlertCircle, Eye, EyeOff } from "lucide-react";

interface PatientActivation {
  id: string;
  status: string;
  activation_fee: number;
  activated_at: string | null;
  patient_id: string;
}

interface PatientProfile {
  id: string;
  name: string;
  email: string;
}

interface PatientData {
  patient_id: string;
  status: string;
  profiles: PatientProfile;
}

interface Patient {
  id: string;
  name: string;
  email: string;
  lastSession?: string;
  progress: number;
  status: 'active' | 'inactive' | 'pending_payment';
  activationId?: string;
}

interface PatientFormData {
  name: string;
  email: string;
  password: string;
}

const EnhancedPatientsList = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PatientFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Query para buscar pacientes
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['psychologist-patients'],
    queryFn: async () => {
      // First get the patients with their profiles
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select(`
          patient_id,
          status,
          profiles!patients_patient_id_fkey(id, name, email)
        `)
        .eq('status', 'active');

      if (patientsError) throw patientsError;

      // Then get the patient activations separately
      const patientIds = patientsData?.map(p => p.patient_id) || [];
      
      let activationsData: PatientActivation[] = [];
      if (patientIds.length > 0) {
        const { data: activations, error: activationsError } = await supabase
          .from('patient_activations')
          .select('id, status, activation_fee, activated_at, patient_id')
          .in('patient_id', patientIds);

        if (activationsError) throw activationsError;
        activationsData = activations || [];
      }

      // Combine the data
      return (patientsData as PatientData[]).map(p => {
        const activation = activationsData.find(a => a.patient_id === p.patient_id);
        
        return {
          id: p.profiles.id,
          name: p.profiles.name,
          email: p.profiles.email,
          lastSession: "N/A",
          progress: Math.floor(Math.random() * 100), // Placeholder
          status: activation?.status === 'active' ? 'active' : 
                  activation?.status === 'pending' ? 'pending_payment' : 'inactive',
          activationId: activation?.id
        } as Patient;
      });
    }
  });

  // Mutation para adicionar paciente
  const addPatientMutation = useMutation({
    mutationFn: async (data: PatientFormData) => {
      const { data: result, error } = await supabase.functions.invoke('add-patient', {
        body: data
      });

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['psychologist-patients'] });
      toast({
        title: "Paciente adicionado com sucesso!",
        description: `${data.patient.name} foi adicionado. Email enviado com credenciais.`,
      });
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar paciente",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  });

  // Mutation para processar pagamento
  const processPaymentMutation = useMutation({
    mutationFn: async (activationId: string) => {
      const { data, error } = await supabase.functions.invoke('process-patient-payment', {
        body: { activationId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Redirecionar para Stripe Checkout
      window.open(data.sessionUrl, '_blank');
    },
    onError: (error: any) => {
      toast({
        title: "Erro no pagamento",
        description: error.message || "Não foi possível processar o pagamento.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: PatientFormData) => {
    addPatientMutation.mutate(data);
  };

  const handlePayment = (activationId: string) => {
    processPaymentMutation.mutate(activationId);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default" as const, label: "Ativo", icon: CheckCircle, color: "text-green-600" },
      pending_payment: { variant: "secondary" as const, label: "Pagamento Pendente", icon: Clock, color: "text-yellow-600" },
      inactive: { variant: "destructive" as const, label: "Inativo", icon: AlertCircle, color: "text-red-600" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pacientes</h2>
          <p className="text-gray-600">Gerencie seus pacientes e ativações</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Paciente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Paciente</DialogTitle>
              <DialogDescription>
                Adicione um novo paciente definindo nome, email e senha. 
                Taxa de ativação: R$ 20,00.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: "Nome é obrigatório" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do paciente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  rules={{ 
                    required: "Email é obrigatório",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Email inválido"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  rules={{ 
                    required: "Senha é obrigatória",
                    minLength: {
                      value: 6,
                      message: "Senha deve ter pelo menos 6 caracteres"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Senha do paciente" 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={addPatientMutation.isPending}
                  >
                    {addPatientMutation.isPending ? "Adicionando..." : "Adicionar Paciente"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Carregando pacientes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{patient.name}</CardTitle>
                      <CardDescription>{patient.email}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(patient.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Última sessão: {patient.lastSession}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Progresso</span>
                    <span className="font-medium">{patient.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${patient.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex space-x-2 pt-3">
                  {patient.status === 'pending_payment' && patient.activationId && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50"
                      onClick={() => handlePayment(patient.activationId!)}
                      disabled={processPaymentMutation.isPending}
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      {processPaymentMutation.isPending ? "Processando..." : "Pagar R$ 20"}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="flex-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Progresso
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Ver Perfil
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedPatientsList;
