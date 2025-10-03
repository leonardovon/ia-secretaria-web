import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addWeeks, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Appointment {
  id: string;
  paciente_id: string;
  medico_id: string;
  data_agendamento: string;
  procedimento: string;
  informacoes_adicionais: string | null;
  status: string;
}

interface Patient {
  id: string;
  nome: string;
}

interface Doctor {
  id: string;
  nome: string;
}

interface WeeklyCalendarProps {
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  onEditAppointment?: (appointment: Appointment) => void;
}

export function WeeklyCalendar({ appointments, patients, doctors, onEditAppointment }: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  const weekStart = startOfWeek(currentWeek, { locale: ptBR });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Horários da clínica: 8h às 18h, intervalos de 30 minutos
  const timeSlots = Array.from({ length: 21 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  const getPatientName = (patientId: string) => {
    return patients.find(p => p.id === patientId)?.nome || 'Paciente não encontrado';
  };

  const getDoctorName = (doctorId: string) => {
    return doctors.find(d => d.id === doctorId)?.nome || 'Médico não encontrado';
  };

  const getAppointmentsForSlot = (day: Date, time: string) => {
    return appointments.filter(apt => {
      const aptDate = parseISO(apt.data_agendamento);
      const aptTime = format(aptDate, 'HH:mm');
      return isSameDay(aptDate, day) && aptTime === time;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado':
        return 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300';
      case 'confirmado':
        return 'bg-green-500/20 border-green-500 text-green-700 dark:text-green-300';
      case 'cancelado':
        return 'bg-red-500/20 border-red-500 text-red-700 dark:text-red-300';
      case 'concluido':
        return 'bg-gray-500/20 border-gray-500 text-gray-700 dark:text-gray-300';
      default:
        return 'bg-muted border-border text-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentWeek(addWeeks(currentWeek, -1))}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Semana Anterior
        </Button>
        <h3 className="text-lg font-semibold">
          {format(weekStart, 'dd MMM', { locale: ptBR })} - {format(addDays(weekStart, 6), 'dd MMM yyyy', { locale: ptBR })}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
        >
          Próxima Semana
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <Card className="overflow-auto">
        <div className="min-w-[1000px]">
          {/* Header com dias da semana */}
          <div className="grid grid-cols-8 border-b bg-muted/50">
            <div className="p-3 font-semibold border-r text-sm">Horário</div>
            {weekDays.map((day, index) => (
              <div key={index} className="p-3 text-center border-r last:border-r-0">
                <div className="font-semibold text-sm">
                  {format(day, 'EEEE', { locale: ptBR })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(day, 'dd/MM', { locale: ptBR })}
                </div>
              </div>
            ))}
          </div>

          {/* Grid de horários */}
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-8 border-b last:border-b-0 min-h-[80px]">
              <div className="p-3 border-r bg-muted/30 flex items-start">
                <span className="text-sm font-medium">{time}</span>
              </div>
              {weekDays.map((day, dayIndex) => {
                const slotAppointments = getAppointmentsForSlot(day, time);
                return (
                  <div
                    key={dayIndex}
                    className="p-2 border-r last:border-r-0 hover:bg-accent/5 transition-colors"
                  >
                    {slotAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        className={`p-2 rounded border-l-4 mb-2 cursor-pointer hover:shadow-md transition-shadow text-xs ${getStatusColor(apt.status)}`}
                        onClick={() => onEditAppointment?.(apt)}
                      >
                        <div className="font-semibold truncate">
                          {getPatientName(apt.paciente_id)}
                        </div>
                        <div className="truncate text-xs opacity-90">
                          {apt.procedimento}
                        </div>
                        {apt.informacoes_adicionais && (
                          <div className="truncate text-xs opacity-75 mt-1">
                            {apt.informacoes_adicionais}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
