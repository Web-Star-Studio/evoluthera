
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Plus, Clock, FileText, MessageCircle, Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  task_type: 'text' | 'multiple_choice' | 'audio';
  category: 'reflection' | 'writing' | 'meditation' | 'self_assessment' | 'custom';
  options?: any;
  estimated_duration?: number;
  is_public: boolean;
}

interface EnhancedSendTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  onSendTask: (task: any) => void;
}

const EnhancedSendTaskModal = ({ isOpen, onClose, patientId, patientName, onSendTask }: EnhancedSendTaskModalProps) => {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [activeTab, setActiveTab] = useState("templates");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState<'text' | 'multiple_choice' | 'audio'>('text');
  const [category, setCategory] = useState<'reflection' | 'writing' | 'meditation' | 'self_assessment' | 'custom'>('custom');
  const [dueDate, setDueDate] = useState<Date>();
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [estimatedDuration, setEstimatedDuration] = useState<number>();
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<string[]>(['']);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
    }
  };

  const createDefaultTemplates = async () => {
    const defaultTemplates = [
      {
        name: 'Reflexão Diária',
        description: 'Reflita sobre seu dia e identifique 3 pontos positivos e 1 desafio enfrentado.',
        task_type: 'text',
        category: 'reflection',
        estimated_duration: 15,
        is_public: true
      },
      {
        name: 'Autoavaliação de Humor',
        description: 'Avalie seu humor atual e descreva os fatores que podem estar influenciando.',
        task_type: 'multiple_choice',
        category: 'self_assessment',
        estimated_duration: 10,
        is_public: true,
        options: {
          question: "Como você avalia seu humor hoje?",
          choices: ["Muito baixo", "Baixo", "Neutro", "Bom", "Excelente"]
        }
      },
      {
        name: 'Exercício de Respiração',
        description: 'Pratique 5 minutos de respiração consciente e descreva a experiência.',
        task_type: 'text',
        category: 'meditation',
        estimated_duration: 10,
        is_public: true
      },
      {
        name: 'Diário de Gratidão',
        description: 'Escreva sobre 3 coisas pelas quais você é grato hoje e explique o porquê.',
        task_type: 'text',
        category: 'writing',
        estimated_duration: 20,
        is_public: true
      }
    ];

    try {
      for (const template of defaultTemplates) {
        const { error } = await supabase
          .from('task_templates')
          .insert({
            ...template,
            psychologist_id: 'temp-user-id' // Substituir por auth.uid()
          });
        
        if (error) console.error('Erro ao criar template:', error);
      }
      fetchTemplates();
    } catch (error) {
      console.error('Erro ao criar templates padrão:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    if (templates.length === 0 && isOpen) {
      createDefaultTemplates();
    }
  }, [templates, isOpen]);

  const handleTemplateSelect = (template: TaskTemplate) => {
    setSelectedTemplate(template);
    setTitle(template.name);
    setDescription(template.description);
    setTaskType(template.task_type);
    setCategory(template.category);
    setEstimatedDuration(template.estimated_duration || undefined);
    
    if (template.task_type === 'multiple_choice' && template.options?.choices) {
      setMultipleChoiceOptions(template.options.choices);
    }
  };

  const handleAddOption = () => {
    setMultipleChoiceOptions([...multipleChoiceOptions, '']);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...multipleChoiceOptions];
    newOptions[index] = value;
    setMultipleChoiceOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (multipleChoiceOptions.length > 1) {
      const newOptions = multipleChoiceOptions.filter((_, i) => i !== index);
      setMultipleChoiceOptions(newOptions);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        task_type: taskType,
        patient_id: patientId,
        psychologist_id: 'temp-user-id', // Substituir por auth.uid()
        due_date: dueDate?.toISOString(),
        priority,
        estimated_duration: estimatedDuration,
        template_id: selectedTemplate?.id,
        options: taskType === 'multiple_choice' ? {
          question: description,
          choices: multipleChoiceOptions.filter(opt => opt.trim())
        } : null
      };

      await onSendTask(taskData);
      handleClose();
      
      toast({
        title: "Tarefa enviada!",
        description: `Tarefa "${title}" foi enviada para ${patientName}.`,
      });
    } catch (error) {
      console.error('Erro ao enviar tarefa:', error);
      toast({
        title: "Erro ao enviar tarefa",
        description: "Não foi possível enviar a tarefa. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setTaskType('text');
    setCategory('custom');
    setDueDate(undefined);
    setPriority('normal');
    setEstimatedDuration(undefined);
    setMultipleChoiceOptions(['']);
    setSelectedTemplate(null);
    setActiveTab("templates");
    onClose();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'reflection': return 'bg-blue-100 text-blue-800';
      case 'writing': return 'bg-green-100 text-green-800';
      case 'meditation': return 'bg-purple-100 text-purple-800';
      case 'self_assessment': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'multiple_choice': return <MessageCircle className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enviar Nova Tarefa</DialogTitle>
          <p className="text-sm text-gray-600">Para: {patientName}</p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="custom">Personalizada</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card 
                  key={template.id} 
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedTemplate?.id === template.id ? 'ring-2 ring-emerald-500' : ''
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        {getTaskTypeIcon(template.task_type)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                      {template.estimated_duration && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {template.estimated_duration}min
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs">
                      {template.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedTemplate && (
              <div className="mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título da Tarefa *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {taskType === 'multiple_choice' && (
                    <div>
                      <Label>Opções de Resposta</Label>
                      {multipleChoiceOptions.map((option, index) => (
                        <div key={index} className="flex gap-2 mt-2">
                          <Input
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Opção ${index + 1}`}
                          />
                          {multipleChoiceOptions.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveOption(index)}
                            >
                              Remover
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddOption}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar Opção
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Prioridade</Label>
                      <Select value={priority} onValueChange={(value: 'low' | 'normal' | 'high') => setPriority(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Duração Estimada (min)</Label>
                      <Input
                        type="number"
                        value={estimatedDuration || ''}
                        onChange={(e) => setEstimatedDuration(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="15"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Data de Vencimento (Opcional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dueDate ? format(dueDate, "PPP", { locale: ptBR }) : "Selecionar data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={handleClose}>
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={!title.trim() || isSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isSubmitting ? "Enviando..." : "Enviar Tarefa"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="custom-title">Título da Tarefa *</Label>
                <Input
                  id="custom-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Exercício personalizado"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="custom-description">Descrição</Label>
                <Textarea
                  id="custom-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva detalhadamente a tarefa..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Tarefa</Label>
                  <Select value={taskType} onValueChange={(value: 'text' | 'multiple_choice' | 'audio') => setTaskType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="multiple_choice">Múltipla Escolha</SelectItem>
                      <SelectItem value="audio">Áudio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Categoria</Label>
                  <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reflection">Reflexão</SelectItem>
                      <SelectItem value="writing">Escrita</SelectItem>
                      <SelectItem value="meditation">Meditação</SelectItem>
                      <SelectItem value="self_assessment">Autoavaliação</SelectItem>
                      <SelectItem value="custom">Personalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {taskType === 'multiple_choice' && (
                <div>
                  <Label>Opções de Resposta</Label>
                  {multipleChoiceOptions.map((option, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Opção ${index + 1}`}
                      />
                      {multipleChoiceOptions.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveOption(index)}
                        >
                          Remover
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Opção
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prioridade</Label>
                  <Select value={priority} onValueChange={(value: 'low' | 'normal' | 'high') => setPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Duração Estimada (min)</Label>
                  <Input
                    type="number"
                    value={estimatedDuration || ''}
                    onChange={(e) => setEstimatedDuration(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="15"
                  />
                </div>
              </div>
              
              <div>
                <Label>Data de Vencimento (Opcional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP", { locale: ptBR }) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={!title.trim() || isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? "Enviando..." : "Enviar Tarefa"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedSendTaskModal;
