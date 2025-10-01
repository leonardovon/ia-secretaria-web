import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { LogOut, Save, Building2, Phone, MapPin, User, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';

const configSchema = z.object({
  nome_clinica: z.string().trim().min(1, 'Nome da clínica é obrigatório').max(255),
  telefone: z.string().trim().min(1, 'Telefone é obrigatório').max(20),
  endereco: z.string().trim().max(500).optional(),
  login: z.string().trim().min(3, 'Login deve ter no mínimo 3 caracteres').max(50),
  senha_hash: z.string().optional(),
});

type ConfigFormData = z.infer<typeof configSchema>;

interface Config {
  id: string;
  nome_clinica: string;
  telefone: string;
  endereco: string | null;
  login: string;
  senha_hash: string;
  created_at: string;
  updated_at: string;
}

export default function Configuracoes() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ConfigFormData>({
    nome_clinica: '',
    telefone: '',
    endereco: '',
    login: '',
    senha_hash: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: config, isLoading } = useQuery({
    queryKey: ['clinic-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .schema('clinica')
        .from('config')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as Config | null;
    },
  });

  useEffect(() => {
    if (config) {
      setFormData({
        nome_clinica: config.nome_clinica,
        telefone: config.telefone,
        endereco: config.endereco || '',
        login: config.login,
        senha_hash: '',
      });
    }
  }, [config]);

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Config>) => {
      if (!config?.id) {
        // Create new config if doesn't exist
        const { data, error } = await supabase
          .schema('clinica')
          .from('config')
          .insert([updates])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Update existing config
        const { data, error } = await supabase
          .schema('clinica')
          .from('config')
          .update(updates)
          .eq('id', config.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-config'] });
      toast.success('Configurações salvas com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao salvar configurações: ' + error.message);
    },
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const validateForm = (): boolean => {
    try {
      // Remove senha_hash from validation if empty (user doesn't want to change password)
      const dataToValidate = { ...formData };
      if (!dataToValidate.senha_hash) {
        delete dataToValidate.senha_hash;
      }
      
      configSchema.parse(dataToValidate);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    const updates: Partial<Config> = {
      nome_clinica: formData.nome_clinica.trim(),
      telefone: formData.telefone.trim(),
      endereco: formData.endereco?.trim() || null,
      login: formData.login.trim(),
    };

    // Only update password if a new one was provided
    if (formData.senha_hash && formData.senha_hash.trim()) {
      updates.senha_hash = formData.senha_hash.trim();
    }

    updateMutation.mutate(updates);
  };

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
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Configurações</h2>
          <p className="text-muted-foreground">
            Configure os dados da clínica
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Carregando configurações...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-3xl">
            <form onSubmit={handleSubmit}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Dados da Clínica
                  </CardTitle>
                  <CardDescription>
                    Informações básicas sobre a clínica
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="nome_clinica">Nome da Clínica *</Label>
                    <Input
                      id="nome_clinica"
                      value={formData.nome_clinica}
                      onChange={(e) => setFormData({ ...formData, nome_clinica: e.target.value })}
                      placeholder="Nome da clínica"
                      className={errors.nome_clinica ? 'border-red-500' : ''}
                    />
                    {errors.nome_clinica && (
                      <p className="text-sm text-red-500 mt-1">{errors.nome_clinica}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="telefone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Telefone *
                    </Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(99) 99999-9999"
                      className={errors.telefone ? 'border-red-500' : ''}
                    />
                    {errors.telefone && (
                      <p className="text-sm text-red-500 mt-1">{errors.telefone}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="endereco" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Endereço
                    </Label>
                    <Textarea
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                      placeholder="Endereço completo da clínica"
                      rows={3}
                      className={errors.endereco ? 'border-red-500' : ''}
                    />
                    {errors.endereco && (
                      <p className="text-sm text-red-500 mt-1">{errors.endereco}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Credenciais de Acesso
                  </CardTitle>
                  <CardDescription>
                    Configurações de login do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="login">Login *</Label>
                    <Input
                      id="login"
                      value={formData.login}
                      onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                      placeholder="Nome de usuário"
                      className={errors.login ? 'border-red-500' : ''}
                    />
                    {errors.login && (
                      <p className="text-sm text-red-500 mt-1">{errors.login}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="senha_hash" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Nova Senha
                    </Label>
                    <Input
                      id="senha_hash"
                      type="password"
                      value={formData.senha_hash}
                      onChange={(e) => setFormData({ ...formData, senha_hash: e.target.value })}
                      placeholder="Deixe em branco para manter a senha atual"
                      className={errors.senha_hash ? 'border-red-500' : ''}
                    />
                    {errors.senha_hash && (
                      <p className="text-sm text-red-500 mt-1">{errors.senha_hash}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      Preencha apenas se deseja alterar a senha
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full"
                disabled={updateMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
