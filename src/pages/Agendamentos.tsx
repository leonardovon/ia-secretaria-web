import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { LogOut, Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const { logout, clinicId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [formData, setFormData] = useState({
    paciente_id: '',
    medico_id: '',
    data_agendamento: '',
    procedimento: 'Consulta',
    informacoes_adicionais: '',
    status: 'agendado',
  });

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await (supabase as any).rpc('get_clinic_agendamentos', {
        p_clinic_id: clinicId,
      } as any);
      
      if (error) throw error;
      return ((data || []) as unknown) as Appointment[];
    },
    enabled: !!clinicId,
  });

  const { data: patients = [] } = useQuery<Patient[]>({
    queryKey: ['patients', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await (supabase as any).rpc('get_clinic_pacientes', {
        p_clinic_id: clinicId,
      } as any);
      
      if (error) throw error;
      return ((data || []) as unknown) as Patient[];
    },
    enabled: !!clinicId,
  });

  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ['doctors', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await (supabase as any).rpc('get_clinic_medicos', {
        p_clinic_id: clinicId,
      } as any);
      
      if (error) throw error;
      return ((data || []) as unknown) as Doctor[];
    },
    enabled: !!clinicId,
  });

  const createMutation = useMutation({
    mutationFn: async (newAppointment: Omit<Appointment, 'id' | 'created_at'>) => {
      const { data, error } = await (supabase as any).rpc('create_agendamento', {
        p_clinic_id: clinicId,
        p_paciente_id: newAppointment.paciente_id,
        p_medico_id: newAppointment.medico_id,
        p_data_agendamento: newAppointment.data_agendamento,
        p_procedimento: newAppointment.procedimento,
        p_informacoes_adicionais: newAppointment.informacoes_adicionais,
        p_status: newAppointment.status,
      } as any);
      
      if (error) throw error;
      return data as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', clinicId] });
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
      const { data, error } = await (supabase as any).rpc('update_agendamento', {
        p_agendamento_id: id,
        p_paciente_id: updates.paciente_id,
        p_medico_id: updates.medico_id,
        p_data_agendamento: updates.data_agendamento,
        p_procedimento: updates.procedimento,
        p_informacoes_adicionais: updates.informacoes_adicionais,
        p_status: updates.status,
      } as any);
      
      if (error) throw error;
      return data as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', clinicId] });
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
      const { error } = await (supabase as any).rpc('delete_agendamento', {
        p_agendamento_id: id,
      } as any);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments', clinicId] });
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

  // Funções auxiliares para a visualização semanal
  const getWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // Ajustar para segunda-feira
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff + (weekOffset * 7));
    monday.setHours(0, 0, 0, 0);
    
    const weekDays = [];
    for (let i = 0; i < 5; i++) { // Segunda a Sexta
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      weekDays.push(day);
    }
    return weekDays;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setWeekOffset(prev => direction === 'next' ? prev + 1 : prev - 1);
  };

  const getWeekLabel = () => {
    const days = getWeekDays();
    const firstDay = days[0];
    const lastDay = days[days.length - 1];
    return `${firstDay.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - ${lastDay.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 19 && minute > 0) break; // Última consulta é às 19h00
        slots.push({ hour, minute });
      }
    }
    return slots;
  };

  const formatTimeSlot = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const getAppointmentForSlot = (day: Date, hour: number, minute: number) => {
    return appointments.find(appointment => {
      const appointmentDate = new Date(appointment.data_agendamento);
      return (
        appointmentDate.getFullYear() === day.getFullYear() &&
        appointmentDate.getMonth() === day.getMonth() &&
        appointmentDate.getDate() === day.getDate() &&
        appointmentDate.getHours() === hour &&
        appointmentDate.getMinutes() === minute
      );
    });
  };

  const weekDays = getWeekDays();
  const timeSlots = generateTimeSlots();

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

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="calendar">Agenda Semanal</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
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

          <TabsContent value="calendar">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl">Agenda Semanal</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {getWeekLabel()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateWeek('prev')}
                      className="flex-1 sm:flex-initial"
                    >
                      <ChevronLeft className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">Semana Anterior</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setWeekOffset(0)}
                      disabled={weekOffset === 0}
                    >
                      Hoje
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateWeek('next')}
                      className="flex-1 sm:flex-initial"
                    >
                      <span className="hidden sm:inline">Próxima Semana</span>
                      <ChevronRight className="w-4 h-4 sm:ml-1" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <p className="text-center text-muted-foreground py-8">Carregando...</p>
                ) : (
                  <div className="relative">
                    <ScrollArea className="w-full h-[calc(100vh-320px)] min-h-[400px]">
                      <div className="flex">
                        {/* Coluna de horários fixa */}
                        <div className="sticky left-0 z-10 bg-background border-r">
                          <div className="h-12 border-b flex items-center justify-center px-3 font-semibold text-sm bg-muted/50">
                            Horário
                          </div>
                          <div>
                            {timeSlots.map((slot, slotIndex) => (
                              <div
                                key={slotIndex}
                                className="h-16 border-b flex items-center justify-center px-3 text-xs font-medium text-muted-foreground bg-background"
                              >
                                {formatTimeSlot(slot.hour, slot.minute)}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Colunas dos dias */}
                        <div className="flex flex-1">
                          {weekDays.map((day, dayIndex) => (
                            <div key={dayIndex} className="flex-1 min-w-[140px] border-r last:border-r-0">
                              <div className="h-12 border-b flex items-center justify-center px-2 font-semibold text-sm bg-muted/50 sticky top-0 z-5">
                                <div className="text-center">
                                  <div>{day.toLocaleDateString('pt-BR', { weekday: 'short' })}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {day.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                  </div>
                                </div>
                              </div>
                              <div>
                                {timeSlots.map((slot, slotIndex) => {
                                  const appointment = getAppointmentForSlot(day, slot.hour, slot.minute);
                                  return (
                                    <div
                                      key={slotIndex}
                                      className={`h-16 border-b p-1 text-xs transition-colors ${
                                        appointment
                                          ? appointment.status === 'agendado'
                                            ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer'
                                            : appointment.status === 'confirmado'
                                            ? 'bg-green-50 hover:bg-green-100 cursor-pointer'
                                            : appointment.status === 'cancelado'
                                            ? 'bg-red-50 hover:bg-red-100 cursor-pointer'
                                            : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                                          : 'hover:bg-muted/30 cursor-pointer'
                                      }`}
                                      onClick={() => appointment && handleEdit(appointment)}
                                    >
                                      {appointment ? (
                                        <div className="h-full flex flex-col justify-center gap-0.5 px-1">
                                          <div className="font-semibold truncate text-[10px] leading-tight">
                                            {getPatientName(appointment.paciente_id)}
                                          </div>
                                          <div className="text-muted-foreground truncate text-[9px] leading-tight">
                                            {appointment.procedimento}
                                          </div>
                                          <div className="text-muted-foreground truncate text-[9px] leading-tight">
                                            {getDoctorName(appointment.medico_id)}
                                          </div>
                                        </div>
                                      ) : null}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
