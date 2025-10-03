import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeeklyCalendar } from '@/components/WeeklyCalendar';

interface Appointment {
  id: string;
  paciente_id: string;
  medico_id: string;
  data_agendamento: string;
  procedimento: string;
  informacoes_adicionais: string | null;
  status: string;
  created_at: string;
}

interface Patient {
  id: string;
  nome: string;
}

interface Doctor {
  id: string;
  nome: string;
}

export default function Agendamentos() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    paciente_id: '',
    medico_id: '',
    data_agendamento: '',
    procedimento: 'Consulta',
    informacoes_adicionais: '',
    status: 'agendado',
  });

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agendamentos')
        .select('*')
        .order('data_agendamento', { ascending: true });
      
      if (error) throw error;
      return data as Appointment[];
    },
  });

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pacientes')
        .select('id, nome')
        .order('nome');
      
      if (error) throw error;
      return data as Patient[];
    },
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicos')
        .select('id, nome')
        .order('nome');
      
      if (error) throw error;
      return data as Doctor[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newAppointment: Omit<Appointment, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('agendamentos')
        .insert([newAppointment])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Agendamento criado com sucesso!');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Erro ao criar agendamento: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Appointment> & { id: string }) => {
      const { data, error } = await supabase
        .from('agendamentos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Agendamento atualizado com sucesso!');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar agendamento: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Agendamento excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir agendamento: ' + error.message);
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const resetForm = () => {
    setFormData({
      paciente_id: '',
      medico_id: '',
      data_agendamento: '',
      procedimento: 'Consulta',
      informacoes_adicionais: '',
      status: 'agendado',
    });
    setEditingAppointment(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAppointment) {
      updateMutation.mutate({ id: editingAppointment.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      paciente_id: appointment.paciente_id,
      medico_id: appointment.medico_id,
      data_agendamento: appointment.data_agendamento.slice(0, 16),
      procedimento: appointment.procedimento,
      informacoes_adicionais: appointment.informacoes_adicionais || '',
      status: appointment.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      deleteMutation.mutate(id);
    }
  };

  const getPatientName = (patientId: string) => {
    return patients.find(p => p.id === patientId)?.nome || 'Paciente não encontrado';
  };

  const getDoctorName = (doctorId: string) => {
    return doctors.find(d => d.id === doctorId)?.nome || 'Médico não encontrado';
  };

  const filteredAppointments = appointments.filter(appointment => {
    const patientName = getPatientName(appointment.paciente_id).toLowerCase();
    const doctorName = getDoctorName(appointment.medico_id).toLowerCase();
    const query = searchQuery.toLowerCase();
    return patientName.includes(query) || doctorName.includes(query) || appointment.procedimento.toLowerCase().includes(query);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary cursor-pointer" onClick={() => navigate('/dashboard')}>
            Sistema de Gestão
          </h1>
          <Button onClick={handleLogout} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Agendamentos</h2>
            <p className="text-muted-foreground">
              Visualize e gerencie os agendamentos da clínica
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
                <DialogDescription>
                  Preencha os dados do agendamento
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paciente_id">Paciente *</Label>
                    <Select value={formData.paciente_id} onValueChange={(value) => setFormData({ ...formData, paciente_id: value })} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="medico_id">Médico *</Label>
                    <Select value={formData.medico_id} onValueChange={(value) => setFormData({ ...formData, medico_id: value })} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o médico" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="procedimento">Procedimento *</Label>
                    <Input
                      id="procedimento"
                      value={formData.procedimento}
                      onChange={(e) => setFormData({ ...formData, procedimento: e.target.value })}
                      required
                      placeholder="Ex: Consulta"
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_agendamento">Data/Hora *</Label>
                    <Input
                      id="data_agendamento"
                      type="datetime-local"
                      value={formData.data_agendamento}
                      onChange={(e) => setFormData({ ...formData, data_agendamento: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agendado">Agendado</SelectItem>
                      <SelectItem value="confirmado">Confirmado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="informacoes_adicionais">Informações Adicionais</Label>
                  <Textarea
                    id="informacoes_adicionais"
                    value={formData.informacoes_adicionais}
                    onChange={(e) => setFormData({ ...formData, informacoes_adicionais: e.target.value })}
                    placeholder="Observações sobre o agendamento..."
                    rows={3}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingAppointment ? 'Atualizar' : 'Criar'} Agendamento
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="lista" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="lista">Lista de Agendamentos</TabsTrigger>
            <TabsTrigger value="calendario">Calendário</TabsTrigger>
          </TabsList>

          <TabsContent value="lista">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Agendamentos</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por paciente, médico ou procedimento..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-center text-muted-foreground py-8">Carregando...</p>
                ) : filteredAppointments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhum agendamento encontrado</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Médico</TableHead>
                        <TableHead>Procedimento</TableHead>
                        <TableHead>Data/Hora</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell className="font-medium">{getPatientName(appointment.paciente_id)}</TableCell>
                          <TableCell>{getDoctorName(appointment.medico_id)}</TableCell>
                          <TableCell>{appointment.procedimento}</TableCell>
                          <TableCell>{new Date(appointment.data_agendamento).toLocaleString('pt-BR')}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              appointment.status === 'agendado' ? 'bg-blue-100 text-blue-800' :
                              appointment.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(appointment)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(appointment.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendario">
            <WeeklyCalendar
              appointments={appointments}
              patients={patients}
              doctors={doctors}
              onEditAppointment={handleEdit}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
